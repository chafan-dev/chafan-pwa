<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row v-else class="mb-12" justify="center">
      <v-col
        :class="{
          'col-8': $vuetify.breakpoint.mdAndUp && !isNarrowFeedUI,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !$vuetify.breakpoint.mdAndUp,
        }"
      >
        <v-tabs>
          <v-tab>问题</v-tab>
          <v-tab-item>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadQuestions"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <QuestionPreview :questionPreview="item" />
            </DynamicItemList>
          </v-tab-item>
        </v-tabs>
      </v-col>

      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <TopicCard :topic="topic" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <InfoIcon />
            <span class="ml-1 grey--text">话题信息</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <TopicCard :topic="topic" />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from '@/router';
import { apiTopic } from '@/api/topic';
import { IQuestionPreview, ITopic } from '@/interfaces';
import TopicCard from '@/components/TopicCard.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';
import { readNarrowUI } from '@/store/main/getters';
import { useAuth } from '@/composables';

const store = useStore();
const route = useRoute();
const { token } = useAuth();

const topic = ref<ITopic | null>(null);
const questions = ref<IQuestionPreview[]>([]);
const loading = ref(true);
const loadingProgress = ref(0);

const id = computed(() => route.params.id as string);
const isNarrowFeedUI = computed(() => readNarrowUI(store));

async function load() {
  await dispatchCaptureApiError(store, async () => {
    const response = await apiTopic.getTopic(id.value);
    loadingProgress.value = 33;
    if (response) {
      topic.value = response.data;
      loadingProgress.value = 100;
      loading.value = false;
    }
  });
}

// Watch for route param changes (replaces beforeRouteUpdate)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && route.name === 'topic') {
    loading.value = true;
    loadingProgress.value = 0;
    questions.value = [];
    load();
  }
});

onMounted(async () => {
  await load();
});

async function loadQuestions(skip: number, limit: number) {
  // TODO: implement pagination
  if (skip > 0) {
    return [];
  }
  let items: IQuestionPreview[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    if (topic.value !== null) {
      items = (await apiTopic.getQuestionsOfTopic(token.value, topic.value.uuid)).data;
    }
  });
  return items;
}
</script>
