<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': isDesktop }">
        <div>
          <v-overlay v-model="overlay" opacity="0.5" z-index="10">
            <v-progress-circular indeterminate />
          </v-overlay>
          <div class="d-flex justify-end">
            <v-btn class="mr-2" depressed small :href="`/article-columns/${this.articleColumnId}`">
              返回专栏
            </v-btn>
            <v-btn class="mr-2" depressed small :href="`/articles/${this.articleId}`">
              返回文章
            </v-btn>
          </div>
          <!-- Editor of title -->
          <v-textarea
            v-model="articleTitle"
            auto-grow
            class="headline my-4"
            dense
            label="标题"
            rows="1"
            hide-details
          />

          <!-- Editor of body -->
          <ChafanTiptap
            v-show="topLevelEditor === 'tiptap'"
            ref="tiptap"
            :onEditorChange="onEditorChange"
            class="mb-2 mt-2"
            placeholder="开始写作"
          />
          <VditorCF
            v-if="editor !== null && body !== null"
            v-show="topLevelEditor === 'vditor'"
            ref="vditor"
            :editor-mode="editor"
            :initial-content="body"
            :isMobile="!isDesktop"
            :onEditorChange="onEditorChange"
            :vditorUploadConfig="vditorUploadConfig"
            placeholder="开始写作"
            class="mb-2 mt-2"
          />

          <!-- Controls -->
          <div class="d-flex align-center">
            <v-btn
              :disabled="savingIntermediate"
              color="primary"
              depressed
              small
              @click="submitEdit(true)"
            >
              发表
            </v-btn>
            <span class="ml-2">
              <!-- NOTE: wrap in span to avoid ml-2 problem when disabled during progress -->
              <v-btn
                :disabled="savingIntermediate"
                color="info"
                depressed
                small
                @click="submitEdit(false)"
              >
                保存草稿
              </v-btn>
            </span>
            <v-btn class="ml-2" depressed small @click="showHelp = !showHelp">帮助</v-btn>
            <v-progress-circular
              v-if="savingIntermediate"
              class="ml-2"
              color="primary"
              indeterminate
              size="20"
            />
            <v-spacer />
            <span v-if="isDesktop" class="mr-2 text-caption grey--text">
              <template v-if="lastAutoSavedAt">
                自动保存于
                {{ $dayjs.utc(lastAutoSavedAt).local().format('HH:mm:ss') }}
              </template>
            </span>

            <v-tooltip v-if="articleId" bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on" class="d-flex">
                  <HistoryIcon class="ml-2" @click="showHistoryDialog" />
                </div>
              </template>
              <span>版本历史</span>
            </v-tooltip>

            <v-menu :close-on-content-click="false" offset-y top>
              <template v-slot:activator="{ on, attrs }">
                <SettingsIcon v-bind="attrs" v-on="on" class="ml-1" />
              </template>
              <v-list dense>
                <v-list-item @click="showDeleteDraftDialog = true">
                  <v-list-item-icon>
                    <DeleteIcon />
                  </v-list-item-icon>
                  <v-list-item-content>删除</v-list-item-content>
                </v-list-item>
                <v-list-item v-if="topLevelEditorItems">
                  <v-list-item-icon>
                    <EditIcon />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-select
                      v-model="topLevelEditor"
                      :items="topLevelEditorItems"
                      dense
                      item-text="text"
                      item-value="value"
                      @change="onChangeTopLevelEditor"
                    />
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-dialog v-model="showDeleteDraftDialog" max-width="400">
              <v-card>
                <v-card-title primary-title> 删除当前草稿？</v-card-title>
                <v-card-text> 不影响已发表版本</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="warning" @click="deleteDraft">确认</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="historyDialog" max-width="900">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">版本历史</div>
                  <v-spacer />
                  <span class="text-caption grey--text">点击展开</span>
                </v-card-title>

                <v-expansion-panels v-if="articleArchives">
                  <v-expansion-panel v-for="archive in articleArchives" :key="archive.id">
                    <v-expansion-panel-header>
                      <v-btn
                        class="mr-4"
                        depressed
                        max-width="100px"
                        small
                        @click="loadArticleArchive(archive)"
                        >加载该版本
                      </v-btn>
                      {{ fromNow(archive.created_at) }}
                      <v-spacer />
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div class="title">
                        {{ archive.title }}
                      </div>
                      <Viewer :content="archive.content" />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>

                <v-pagination
                  v-model="archivePage"
                  :length="archivePagesLength"
                  @input="changeArchivePage"
                />
              </v-card>
            </v-dialog>
          </div>
          <EditorHelp :show-help="showHelp" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  clearLocalEdit,
  getArticleDraft,
  logDebug,
  newArticleHandler,
  saveLocalEdit,
  uuidv4,
} from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { editor_T, IArticle, IArticleArchive, IRichEditorState } from '@/interfaces';
import { apiArticle } from '@/api/article';
import { commitAddNotification } from '@/store/main/mutations';

import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';

import { VditorCF } from 'chafan-vue-editors';
import EditIcon from '@/components/icons/EditIcon.vue';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import EditorHelp from '@/components/editor/EditorHelp.vue';
import { readToken, readUserProfile } from '@/store/main/getters';
import { CVue, getVditorUploadConfig, LABS_TIPTAP_EDITOR_OPTION } from '@/common';
import { Route } from 'vue-router';

@Component({
  components: {
    EditorHelp,
    ChafanTiptap,
    EditIcon,
    VditorCF,
    HistoryIcon,
    DeleteIcon,
    SettingsIcon,
  },
})
export default class ArticleEditor extends CVue {
  private newArticleId: string | null = null;
  private handlingNewEdit = false;

  private showHelp = false;
  private historyDialog = false;
  private overlay = false;
  private articleTitle: string | null = null;
  private archivePage = 1;
  private archivePagesLength = 1;
  private readonly archivePageLimit = 10;

  // prevent double-posting
  private writingSessionUUID = uuidv4();

  private lastAutoSavedAt: string | null = null;
  private lastSaveLength = 0;
  private lastSaveIntermediate = false;
  private lastSaveTimerId: any = null;
  private articleArchives: IArticleArchive[] = [];
  private showDeleteDraftDialog = false;
  private savingIntermediate: boolean = false;
  private archivesCount: number | undefined = undefined;
  private editor: editor_T | null = null;
  private body: string | null = null;
  private topLevelEditor: 'vditor' | 'tiptap' = 'vditor';
  private topLevelEditorItems: { text: string; value: string }[] | null = null;

  get articleColumnId() {
    const id = this.$route.query.articleColumnId;
    if (id) {
      return id.toString();
    }
    return null;
  }

  get articleId() {
    const id = this.$route.query.articleId;
    if (id) {
      return id.toString();
    }
    if (this.newArticleId) {
      return this.newArticleId;
    }
    return null;
  }

  get chafanTiptap() {
    return this.$refs.tiptap as any;
  }

  get vditorComponent() {
    return this.$refs.vditor as any;
  }

  get vditorUploadConfig() {
    return getVditorUploadConfig(readToken(this.$store));
  }

  public async mounted() {
    let workingDraft: IRichEditorState | null = null;
    if (this.articleId) {
      const article: IArticle = (await apiArticle.getArticle(this.token, this.articleId)).data;
      this.archivesCount = article.archives_count;
      const articleDraft = await getArticleDraft(this.$dayjs, this.token, article.uuid);
      if (articleDraft) {
        logDebug('载入最近的草稿');
        commitAddNotification(this.$store, {
          content: '载入最近的草稿',
          color: 'success',
        });
        article.title = articleDraft.title || '';
        article.content.source = articleDraft.body || '';
        article.content.editor = articleDraft.editor;
      }
      workingDraft = {
        title: article.title,
        body: article.content.source,
        rendered_body_text: article.content.rendered_text || null,
        editor: article.content.editor,
        visibility: article.visibility,
        is_draft: true,
      };
    }

    logDebug(`mounted workingDraft: ${JSON.stringify(workingDraft)}`);
    if (workingDraft && workingDraft.body !== null) {
      this.articleTitle = workingDraft.title || '';
      this.initEditor(workingDraft.body, workingDraft.editor);
      this.lastSaveLength = workingDraft.body.length;
    } else {
      this.initEditor(null, 'wysiwyg');
    }

    if (this.archivesCount !== undefined) {
      this.archivePagesLength = Math.ceil(this.archivesCount / this.archivePageLimit);
    }

    const topLevelEditorItems = [
      {
        text: 'Vditor 编辑器',
        value: 'vditor',
      },
    ];
    const userProfile = readUserProfile(this.$store);
    if (userProfile!.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION)) {
      topLevelEditorItems.push({
        text: 'Tiptap 编辑器',
        value: 'tiptap',
      });
    }
    this.topLevelEditorItems = topLevelEditorItems;
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
            content: '文章标题太短了，不得少于5个字。',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        this.savingIntermediate = false;
        this.formIsDirty = false;
        return;
      }
      if (
        !payload.edit.rendered_body_text ||
        payload.edit.rendered_body_text.length < 1 ||
        !payload.edit.body
      ) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.$store, {
            content: '文章内容太短了，不得少于5个字。',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        this.savingIntermediate = false;
        this.formIsDirty = false;
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
          clearLocalEdit('article', article.uuid);
          this.newArticleId = article.uuid;
          if (!payload.isAutosaved) {
            commitAddNotification(this.$store, {
              content: payload.edit.is_draft ? '草稿已保存' : '已发表',
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
          const response = await apiArticle.updateArticle(this.token, articleId, {
            updated_title: payload.edit.title,
            visibility: payload.edit.visibility,
            is_draft: payload.edit.is_draft,
            updated_content: {
              source: payload.edit.body,
              rendered_text: payload.edit.rendered_body_text || undefined,
              editor: payload.edit.editor,
            },
          });
          payload.saveArticleCallback(response.data);
          clearLocalEdit('article', response.data.uuid);
          if (!payload.isAutosaved) {
            commitAddNotification(this.$store, {
              content: payload.edit.is_draft ? '文章草稿已更新' : '更新已发表',
              color: 'success',
            });
          }
        }
      }
      this.handlingNewEdit = false;
    });
    this.savingIntermediate = false;
  }

  private getEditorMode(): editor_T {
    if (this.topLevelEditor === 'tiptap') {
      return 'tiptap';
    } else if (this.topLevelEditor === 'vditor') {
      return this.vditorComponent.getMode();
    }
    commitAddNotification(this.$store, {
      content: '编辑器错误',
      color: 'error',
    });
    return 'wysiwyg';
  }

  private getContent(): string | null {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as any).getContent();
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as any).getContent();
    }
    commitAddNotification(this.$store, {
      content: '编辑器错误',
      color: 'error',
    });
    return '';
  }

  private getTextContent(): string | null {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as any).getText();
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as any).getText();
    }
    commitAddNotification(this.$store, {
      content: '编辑器错误',
      color: 'error',
    });
    return null;
  }

  private readState(isPublished: boolean): IRichEditorState {
    return {
      title: this.articleTitle || '',
      body: this.getContent(),
      rendered_body_text: this.getTextContent(),
      is_draft: !isPublished,
      visibility: 'anyone',
      editor: this.getEditorMode(),
    };
  }

  private initEditor(body: string | null, editor: editor_T) {
    logDebug(`initEditor(${body}, ${editor}})`);
    if (editor === 'tiptap') {
      this.topLevelEditor = 'tiptap';
      if (body) {
        (this.$refs.tiptap as any).loadJSON(JSON.parse(body));
      }
    }
    this.editor = editor;
    this.body = body || '';
  }

  private autoSaveEdit() {
    this.newEditHandler({
      isAutosaved: true,
      articleId: this.articleId ? this.articleId : undefined,
      edit: this.readState(false),
      writingSessionUUID: this.writingSessionUUID,
      saveArticleCallback: (article: IArticle) => {
        logDebug('autoSaveEdit saveCallback');
        this.newArticleId = article.uuid;
        if (article.draft_saved_at) {
          this.lastAutoSavedAt = article.draft_saved_at;
        } else {
          this.lastAutoSavedAt = article.updated_at;
        }
      },
    });
  }

  private submitEdit(isPublished: boolean) {
    this.savingIntermediate = true;
    return this.newEditHandler({
      isAutosaved: false,
      edit: this.readState(isPublished),
      articleId: this.articleId ? this.articleId : undefined,
      writingSessionUUID: this.writingSessionUUID,
      saveArticleCallback: (article: IArticle) => {
        this.lastAutoSavedAt = article.updated_at;
        if (isPublished) {
          this.formIsDirty = false;
        }
      },
    });
  }

  private doAutoSave(textContent: string) {
    if (!this.lastSaveIntermediate) {
      this.lastSaveIntermediate = true;
      this.lastSaveLength = textContent.length;
      this.autoSaveEdit();
      if (this.lastSaveTimerId !== null) {
        clearTimeout(this.lastSaveTimerId);
      }
      this.lastSaveTimerId = setTimeout(() => {
        this.lastSaveIntermediate = false;
      }, 5000);
    }
  }

  private trackingChangesButNotSaving = false;
  private onEditorChange(textContent: string) {
    // Auto save if changed a lot
    if (Math.abs(textContent.length - this.lastSaveLength) > 50) {
      this.doAutoSave(textContent);
    } else {
      // Auto save if not changing for a while
      this.lastSaveTimerId = setTimeout(() => {
        this.doAutoSave(textContent);
      }, 3000);
    }
    if (Math.abs(textContent.length - this.lastSaveLength) > 10) {
      // More frequent local backup
      saveLocalEdit('article', this.articleId, this.readState(false));
    }
  }

  private async showHistoryDialog() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.articleId) {
        this.articleArchives = (
          await apiArticle.getArticleArchives(this.token, this.articleId, 0, this.archivePageLimit)
        ).data;
        if (this.articleArchives.length > 0) {
          this.historyDialog = true;
        } else {
          commitAddNotification(this.$store, {
            content: '尚无历史发表存档',
            color: 'info',
          });
        }
      }
    });
  }

  private loadArticleArchive(archive: IArticleArchive) {
    this.articleTitle = archive.title;
    this.initEditor(archive.content.source, this.getEditorMode());
    this.historyDialog = false;
  }

  private async changeArchivePage() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.articleId) {
        this.articleArchives = (
          await apiArticle.getArticleArchives(
            this.token,
            this.articleId,
            (this.archivePage - 1) * this.archivePageLimit,
            this.archivePageLimit
          )
        ).data;
      }
    });
  }

  private async deleteDraft() {
    this.showDeleteDraftDialog = false;
    if (this.articleId) {
      await apiArticle.deleteArticleDraft(this.token, this.articleId);
      clearLocalEdit('article', this.articleId);
      commitAddNotification(this.$store, {
        content: '草稿已删除',
        color: 'success',
      });
      await this.$router.push(`/articles/${this.articleId}`);
    } else {
      commitAddNotification(this.$store, {
        content: '无法删除草稿',
        color: 'success',
      });
    }
  }

  private onChangeTopLevelEditor() {
    if (this.vditorComponent && this.chafanTiptap) {
      if (this.topLevelEditor === 'tiptap') {
        const oldContent = this.vditorComponent.getHTML();
        this.chafanTiptap.loadHTML(oldContent);
      } else {
        const oldContent = this.chafanTiptap.getHTML();
        this.vditorComponent.init('wysiwyg', undefined, oldContent);
      }
    }
  }

  private formIsDirty = true;
  // duplicated in answer editor
  beforeRouteLeave(to: Route, from: Route, next: (boolean?) => void) {
    // If the form is dirty and the user did not confirm leave,
    // prevent losing unsaved changes by canceling navigation
    if (this.formIsDirty && this.confirmStayInDirtyForm()) {
      next(false);
    } else {
      // Navigate to next view
      next();
    }
  }

  created() {
    window.addEventListener('beforeunload', this.beforeWindowUnload);
  }

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeWindowUnload);
  }

  confirmLeave() {
    return window.confirm('确认离开？');
  }

  confirmStayInDirtyForm() {
    return this.formIsDirty && !this.confirmLeave();
  }

  beforeWindowUnload(e) {
    if (this.confirmStayInDirtyForm()) {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    }
  }
}
</script>
