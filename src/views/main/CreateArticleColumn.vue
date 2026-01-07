<template>
  <span>
    <v-btn depressed small @click="dialogNewArticleColumn = true"> 创建新专栏 </v-btn>
    <v-dialog v-model="dialogNewArticleColumn" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">创建新专栏</span>
          <v-spacer />
          <CloseIcon @click="dialogNewArticleColumn = false" />
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
            depressed
            small
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
import { useStore } from 'vuex';
import { useRouter } from '@/router';
import { IArticleColumn, IArticleColumnCreate } from '@/interfaces';
import { commitAddNotification } from '@/store/main/mutations';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { useAuth } from '@/composables';

const props = defineProps<{
  onNewArticleColumn?: (articleColumn: IArticleColumn) => void;
}>();

const store = useStore();
const router = useRouter();
const { token } = useAuth();

const dialogNewArticleColumn = ref(false);
const newArticleColumn = reactive<IArticleColumnCreate>({ name: '' });
const commitNewArticleColumnIntermediate = ref(false);

async function commitNewArticleColumn() {
  if (newArticleColumn.name.length === 0) {
    commitAddNotification(store, {
      content: '专栏名不能为空',
      color: 'error',
    });
    return;
  }
  await dispatchCaptureApiError(store, async () => {
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
