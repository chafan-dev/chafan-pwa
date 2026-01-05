<template>
  <v-card outlined>
    <v-card-title v-if="showTitle" class="primary--text headline"> 提问 </v-card-title>
    <v-card-text>
      <debug-span>SiteSearch loading: {{ siteSearchLoading }}</debug-span>
      <SiteSearch
        v-if="site === undefined"
        v-model="selectedSite"
        :on-start="onSearchStart"
        :on-complete="onSearchComplete"
        label="圈子（默认：大广场）"
      />
      <v-textarea
        class="mt-4"
        v-model="newQuestionTitle"
        auto-grow
        dense
        label="标题"
        rows="3"
        hide-details
      />
      <div class="d-flex">
        <v-spacer />
        <span class="text-caption grey--text"> 创建后添加细节 </span>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :disabled="intermediate || siteSearchLoading"
        color="primary"
        depressed
        small
        @click="postNewQuestion"
      >
        提交新问题
        <v-progress-circular v-if="intermediate || siteSearchLoading" indeterminate size="20" />
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router/composables';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import SiteSearch from '@/components/SiteSearch.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { defaultSiteUuid } from '@/env';
import { useAuth } from '@/composables';
import store from '@/store';

const props = withDefaults(defineProps<{
  site?: ISite;
  showTitle?: boolean;
}>(), {
  showTitle: false,
});

const router = useRouter();
const { token } = useAuth();

const newQuestionTitle = ref('');
const intermediate = ref(false);
const selectedSite = ref<ISite | null>(null);
const siteSearchLoading = ref(false);

function onSearchStart() {
  siteSearchLoading.value = true;
}

function onSearchComplete() {
  siteSearchLoading.value = false;
}

async function postNewQuestion() {
  if (!token.value) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  let siteUUID;
  if (props.site) {
    siteUUID = props.site.uuid;
  } else if (selectedSite.value) {
    siteUUID = selectedSite.value.uuid;
  } else {
    siteUUID = defaultSiteUuid;
  }
  if (newQuestionTitle.value.length < 5) {
    commitAddNotification(store, {
      content: '标题太短了',
      color: 'error',
    });
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    const response = await apiQuestion.postQuestion(token.value!, {
      site_uuid: siteUUID,
      title: newQuestionTitle.value,
    });
    intermediate.value = false;
    if (response) {
      try {
        localStorage.setItem('new-question', 'true');
      } catch (e) {}
      await router.push(`/questions/${response.data.uuid}`);
    }
  });
}
</script>
