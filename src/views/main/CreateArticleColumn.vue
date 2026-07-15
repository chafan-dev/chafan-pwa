<template>
  <span>
    <v-btn variant="tonal" size="small" @click="dialogNewArticleColumn = true"> 创建新专栏 </v-btn>
    <v-dialog v-model="dialogNewArticleColumn" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">创建新专栏</span>
          <v-spacer />
          <AppIcon name="Close" @click="dialogNewArticleColumn = false"  />
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newArticleColumn.name" label="专栏名称" required />
          <v-textarea v-model="newArticleColumn.description" label="专栏描述" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="commitNewArticleColumnIntermediate"
            color="primary"
            variant="flat"
            size="small"
            @click="commitNewArticleColumn"
            >创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { IArticleColumn, IArticleColumnCreate } from '@/interfaces';
import { apiArticle } from '@/api/article';
import { useAuth } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useNotificationStore } from '@/stores/notifications';
const store = useMainStore();

const props = defineProps<{
  onNewArticleColumn?: (articleColumn: IArticleColumn) => void;
}>();

const router = useRouter();
const { token } = useAuth();

const dialogNewArticleColumn = ref(false);
const newArticleColumn = reactive<IArticleColumnCreate>({ name: '' });
const commitNewArticleColumnIntermediate = ref(false);

async function commitNewArticleColumn() {
  if (newArticleColumn.name.length === 0) {
    useNotificationStore().push({
      content: '专栏名不能为空',
      color: 'error',
    });
    return;
  }
  await store.captureApiError(async () => {
    commitNewArticleColumnIntermediate.value = true;
    const response = await apiArticle.createArticleColumn(token.value, newArticleColumn);
    if (props.onNewArticleColumn) {
      props.onNewArticleColumn(response.data);
      dialogNewArticleColumn.value = false;
    } else {
      await router.push(`/article-columns/${response.data.uuid}`);
    }
  });
}
</script>
