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

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { CVue } from '@/common';
import { IArticleColumnCreate } from '@/interfaces';
import { commitAddNotification } from '@/store/main/mutations';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import CloseIcon from '@/components/icons/CloseIcon.vue';
@Component({
  components: { CloseIcon },
})
export default class CreateArticleColumn extends CVue {
  private dialogNewArticleColumn: boolean = false;
  private newArticleColumn: IArticleColumnCreate = { name: '' };
  private commitNewArticleColumnIntermediate = false;

  private async commitNewArticleColumn() {
    if (this.newArticleColumn.name.length === 0) {
      commitAddNotification(this.$store, {
        content: '专栏名不能为空',
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.commitNewArticleColumnIntermediate = true;
      const response = await apiArticle.createArticleColumn(this.token, this.newArticleColumn);
      await this.$router.push(`/article-columns/${response.data.uuid}`);
    });
  }
}
</script>
