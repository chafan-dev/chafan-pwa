<template>
  <v-container v-if="!loading" fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <RichEditor
          class="ma-1"
          :focusMode="true"
          :articleIdProp="articleId !== null ? articleId : undefined"
          :hasTitle="true"
          @submit-edit="newEditHandler"
          @delete-draft="deleteDraft"
          @cancel-edit="cancelHandler"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { newArticleHandler } from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { IRichEditorState, IArticle } from '@/interfaces';
import { apiArticle } from '@/api/article';
import { commitAddNotification, commitSetWorkingDraft } from '@/store/main/mutations';

@Component
export default class ArticleFocusMode extends Vue {
  get articleColumnId() {
    const id = this.$router.currentRoute.query.articleColumnId;
    if (id) {
      return id.toString();
    }
    return null;
  }
  get articleId() {
    const id = this.$router.currentRoute.query.articleId;
    if (id !== undefined) {
      return id.toString();
    }
    if (this.newArticleId) {
      return this.newArticleId;
    }
    return null;
  }
  private newArticleId: string | null = null;
  private loading = true;

  private handlingNewEdit = false;

  public async mounted() {
    if (this.articleId) {
      const article = (await apiArticle.getArticle(this.$store.state.main.token, this.articleId))
        .data;
      const articleDraft = (
        await apiArticle.getArticleDraft(this.$store.state.main.token, article.uuid)
      ).data;
      if (articleDraft.title_draft) {
        commitAddNotification(this.$store, {
          content: this.$t('载入最近的草稿').toString(),
          color: 'success',
        });
        article.title = articleDraft.title_draft;
        if (articleDraft.body_draft) {
          article.body = articleDraft.body_draft;
        }
      }
      commitSetWorkingDraft(this.$store, {
        title: article.title,
        body: article.body,
        rendered_body_text: null,
        math_enabled: article.math_enabled,
        editor: article.editor,
        visibility: article.visibility,
        source_format: article.source_format,
        is_draft: true,
      });
    }
    this.loading = false;
  }
  public async newEditHandler(payload: {
    edit: IRichEditorState;
    isAutosaved: boolean;
    articleId?: string;
    writingSessionUUID: string;
    saveArticleCallback: (article: IArticle) => void;
  }) {
    if (this.handlingNewEdit) {
      return;
    }
    this.handlingNewEdit = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (!payload.edit.title || payload.edit.title.length < 5) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.$store, {
            content: this.$t('Article title is too short: minimum length 5 characters.').toString(),
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        return;
      }
      if (!payload.edit.rendered_body_text || payload.edit.rendered_body_text.length < 5) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.$store, {
            content: this.$t('Article body is too short: minimum length 5 characters.').toString(),
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        return;
      }
      if (this.articleColumnId !== null && !this.articleId && !payload.articleId) {
        // FIXME: RichEditor has a local articleId state -- is there a way to prevent this?

        // new article to question
        const article = await newArticleHandler(
          this,
          payload.edit,
          payload.writingSessionUUID,
          payload.isAutosaved,
          this.articleColumnId
        );
        if (article) {
          payload.saveArticleCallback(article);
          this.newArticleId = article.uuid;
          if (!payload.isAutosaved) {
            commitAddNotification(this.$store, {
              content: this.$t(payload.edit.is_draft ? '草稿已保存' : '已发表').toString(),
              color: 'success',
            });
          }
        }
      } else if (
        this.articleColumnId !== null &&
        (this.articleId || payload.articleId) &&
        payload.edit.title
      ) {
        const articleId = this.articleId ? this.articleId : payload.articleId;
        if (articleId) {
          this.newArticleId = articleId;
          const response = await apiArticle.updateArticle(this.$store.state.main.token, articleId, {
            updated_title: payload.edit.title,
            updated_body: payload.edit.body,
            source_format: payload.edit.source_format,
            editor: payload.edit.editor,
            visibility: payload.edit.visibility,
            math_enabled: payload.edit.math_enabled,
            is_draft: payload.edit.is_draft,
          });
          payload.saveArticleCallback(response.data);
          if (!payload.isAutosaved) {
            commitAddNotification(this.$store, {
              content: this.$t(payload.edit.is_draft ? '文章草稿已更新' : '更新已发表').toString(),
              color: 'success',
            });
            this.$router.push(`/articles/${articleId}`);
          }
        }
      }
      this.handlingNewEdit = false;
    });
  }

  private cancelHandler() {
    if (this.articleId) {
      this.$router.push(`/articles/${this.articleId}`);
    } else {
      this.$router.push(`/article-columns/${this.articleColumnId}`);
    }
  }

  private async deleteDraft() {
    if (this.articleId) {
      await apiArticle.deleteArticleDraft(this.$store.state.main.token, this.articleId);
      commitAddNotification(this.$store, {
        content: this.$t('草稿已删除').toString(),
        color: 'success',
      });
      this.cancelHandler();
    } else {
      commitAddNotification(this.$store, {
        content: this.$t('无法删除草稿').toString(),
        color: 'success',
      });
    }
  }
}
</script>
