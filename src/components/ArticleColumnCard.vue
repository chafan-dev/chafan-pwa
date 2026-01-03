<template>
  <div class="pa-2">
    <div v-if="!showColumnEditor">
      <div class="d-flex justify-space-between">
        <router-link
          v-if="compactMode"
          :to="'/article-columns/' + articleColumn.uuid"
          class="text-decoration-none title"
        >
          {{ name }}
        </router-link>
        <h2 v-else>
          {{ name }}
        </h2>
        <div v-if="!showColumnEditor" class="d-flex align-center">
          <template v-if="currentUserId === articleColumn.owner.uuid && !compactMode">
            <span class="grey--text mr-2 text-caption" v-if="subscription"
              >{{ subscription.subscription_count }}人已关注</span
            >
            <v-btn class="slim-btn mr-2" depressed small @click="showColumnEditor = true">
              编辑专栏
            </v-btn>
            <v-btn
              :to="`/article-editor?articleColumnId=${articleColumn.uuid}`"
              class="slim-btn"
              depressed
              color="primary"
              small
            >
              写文章
            </v-btn>
          </template>
          <template v-else-if="subscription && currentUserId !== articleColumn.owner.uuid">
            <v-btn
              v-if="subscription.subscribed_by_me"
              :disabled="cancelSubscribeIntermediate"
              depressed
              small
              @click="cancelSubscribe"
            >
              取消关注 ({{ subscription.subscription_count }})
              <v-progress-circular
                v-show="cancelSubscribeIntermediate"
                :size="20"
                indeterminate
              ></v-progress-circular>
            </v-btn>
            <v-btn
              v-else
              :disabled="subscribeIntermediate"
              color="primary"
              depressed
              small
              @click="subscribe"
            >
              关注 ({{ subscription.subscription_count }})
              <v-progress-circular
                v-show="subscribeIntermediate"
                :size="20"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-btn>
          </template>
        </div>
      </div>
      <div v-if="desc" class="mt-1">
        {{ desc }}
      </div>
      <div class="mt-1">
        <UserLink :show-avatar="true" :user-preview="articleColumn.owner" />
      </div>
    </div>
    <div v-if="showColumnEditor">
      <v-text-field v-model="name" label="专栏名称" />
      <v-textarea v-model="desc" label="专栏描述" rows="3" />
      <div class="d-flex">
        <v-spacer />
        <v-btn class="mr-2" color="primary" depressed small @click="updateArticleColumn"
          >提交
        </v-btn>
        <v-btn depressed small @click="cancelUpdateArticleColumn">取消</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IArticleColumn, IUserArticleColumnSubscription } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import UserLink from '@/components/UserLink.vue';
import { useAuth } from '@/composables';
import store from '@/store';

const props = withDefaults(
  defineProps<{
    articleColumn: IArticleColumn;
    compactMode?: boolean;
    showOwner?: boolean;
  }>(),
  {
    compactMode: false,
    showOwner: false,
  }
);

const { token, currentUserId } = useAuth();

const loading = ref(true);
const subscription = ref<IUserArticleColumnSubscription | null>(null);
const subscribeIntermediate = ref(false);
const cancelSubscribeIntermediate = ref(false);
const showColumnEditor = ref(false);
const name = ref('');
const desc = ref('');

onMounted(async () => {
  name.value = props.articleColumn.name;
  desc.value = props.articleColumn.description;
  if (currentUserId.value) {
    if (props.articleColumn.subscription) {
      subscription.value = props.articleColumn.subscription;
    } else {
      await dispatchCaptureApiError(store, async () => {
        subscription.value = (
          await apiArticle.getArticleColumnSubscription(token.value, props.articleColumn.uuid)
        ).data;
      });
    }
  }
  loading.value = false;
});

async function subscribe() {
  subscribeIntermediate.value = true;
  subscription.value = (
    await apiArticle.subscribeArticleColumn(token.value, props.articleColumn.uuid)
  ).data;
  subscribeIntermediate.value = false;
}

async function cancelSubscribe() {
  cancelSubscribeIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    subscription.value = (
      await apiArticle.unsubscribeArticleColumn(token.value, props.articleColumn.uuid)
    ).data;
    cancelSubscribeIntermediate.value = false;
  });
}

async function updateArticleColumn() {
  const newArticleColumn = (
    await apiArticle.updateArticleColumn(token.value, props.articleColumn.uuid, {
      name: name.value,
      description: desc.value,
    })
  ).data;
  name.value = newArticleColumn.name;
  desc.value = newArticleColumn.description;
  showColumnEditor.value = false;
}

function cancelUpdateArticleColumn() {
  showColumnEditor.value = false;
  desc.value = props.articleColumn.description;
  name.value = props.articleColumn.name;
}
</script>
