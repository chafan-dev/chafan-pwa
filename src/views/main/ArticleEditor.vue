<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <div>
          <v-overlay v-model="overlay" opacity="0.5" z-index="10">
            <v-progress-circular indeterminate />
          </v-overlay>

          <!-- Editor of title -->
          <div>
            <v-textarea
              v-model="articleTitle"
              :label="$t('Title')"
              auto-grow
              class="headline mt-2"
              dense
              rows="1"
            />
          </div>

          <!-- Editor of body -->
          <ChafanTiptap
            v-show="topLevelEditor === 'tiptap'"
            ref="tiptap"
            :onEditorChange="onEditorChange"
            class="mb-2 mt-2"
          />
          <VditorComponent
            v-show="topLevelEditor === 'vditor'"
            ref="vditor"
            :onEditorChange="onEditorChange"
            class="mb-2 mt-2"
          />

          <!-- Controls -->
          <div class="d-flex align-center">
            <v-btn
              color="primary"
              depressed
              small
              @click="submitEdit(true)"
              :disabled="savingIntermediate"
            >
              发表
            </v-btn>
            <span class="ml-2">
              <!-- NOTE: wrap in span to avoid ml-2 problem when disabled during progress -->
              <v-btn
                color="info"
                depressed
                small
                @click="submitEdit(false)"
                :disabled="savingIntermediate"
              >
                保存草稿
              </v-btn>
            </span>
            <v-btn class="ml-2" depressed small @click="cancelHandler">取消</v-btn>
            <v-btn class="ml-2" depressed small @click="showHelp = !showHelp">帮助</v-btn>
            <v-progress-circular
              class="ml-2"
              v-if="savingIntermediate"
              size="20"
              color="primary"
              indeterminate
            />
            <v-spacer />
            <span
              v-if="lastAutoSavedAt && $vuetify.breakpoint.mdAndUp"
              class="mr-2 text-caption grey--text"
            >
              自动保存于
              {{ $dayjs.utc(lastAutoSavedAt).local().fromNow() }}
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
                <v-card-title primary-title> 删除当前草稿？ </v-card-title>
                <v-card-text> 不影响已发表版本 </v-card-text>
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
                      {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                      <v-spacer />
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div class="title">
                        {{ archive.title }}
                      </div>
                      <Viewer :body="archive.body" :editor="archive.editor" />
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
import { Component, Vue } from 'vue-property-decorator';
import { clearLocalEdit, getArticleDraft, newArticleHandler } from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { IRichEditorState, IArticle } from '@/interfaces';
import { apiArticle } from '@/api/article';
import { commitAddNotification } from '@/store/main/mutations';

import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { saveLocalEdit, uuidv4 } from '@/utils';
import { editor_T, IArchive, IArticleArchive } from '@/interfaces';

import VditorComponent from '@/components/editor/VditorComponent.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import EditorHelp from '@/components/editor/EditorHelp.vue';
import { env } from '@/env';
import { readUserProfile } from '@/store/main/getters';
import { LABS_TIPTAP_EDITOR_OPTION } from '@/common';

@Component({
  components: {
    EditorHelp,
    ChafanTiptap,
    EditIcon,
    VditorComponent,
    HistoryIcon,
    DeleteIcon,
    SettingsIcon,
  },
})
export default class ArticleEditor extends Vue {
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

  get token() {
    return this.$store.state.main.token;
  }

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
    if (id !== undefined) {
      return id.toString();
    }
    if (this.newArticleId) {
      return this.newArticleId;
    }
    return null;
  }

  public async mounted() {
    let workingDraft: IRichEditorState | null = null;
    if (this.articleId) {
      const article: IArticle = (
        await apiArticle.getArticle(this.$store.state.main.token, this.articleId)
      ).data;
      this.archivesCount = article.archives_count;
      const articleDraft = await getArticleDraft(
        this.$dayjs,
        this.$store.state.main.token,
        article.uuid
      );
      if (articleDraft) {
        commitAddNotification(this.$store, {
          content: this.$t('载入最近的草稿').toString(),
          color: 'success',
        });
        article.title = articleDraft.title || '';
        article.body = articleDraft.body || '';
        article.editor = articleDraft.editor;
      }
      workingDraft = {
        title: article.title,
        body: article.body,
        rendered_body_text: null,
        editor: article.editor,
        visibility: article.visibility,
        is_draft: true,
      };
    }

    if (workingDraft && workingDraft.body) {
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
        text: this.$t('Vditor').toString(),
        value: 'vditor',
      },
    ];
    const userProfile = readUserProfile(this.$store);
    if (userProfile!.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION)) {
      topLevelEditorItems.push({
        text: this.$t('tiptap').toString(),
        value: 'tiptap',
      });
    }
    this.topLevelEditorItems = topLevelEditorItems;
  }

  private getEditorMode(): editor_T {
    if (this.topLevelEditor === 'tiptap') {
      return 'tiptap';
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as VditorComponent).getMode();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return 'wysiwyg';
  }

  private getContent(): string | null {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as ChafanTiptap).content;
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as VditorComponent).getContent();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return '';
  }

  private getTextContent(): string | null {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as ChafanTiptap).getText();
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as VditorComponent).getText();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
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
    if (editor === 'tiptap') {
      this.topLevelEditor = 'tiptap';
      if (body) {
        (this.$refs.tiptap as ChafanTiptap).loadJSON(JSON.parse(body));
      }
    } else {
      this.topLevelEditor = 'vditor';
      (this.$refs.vditor as VditorComponent).init(editor, body || '');
    }
  }

  private autoSaveEdit() {
    this.newEditHandler({
      isAutosaved: true,
      articleId: this.articleId ? this.articleId : undefined,
      edit: this.readState(false),
      writingSessionUUID: this.writingSessionUUID,
      saveArticleCallback: (article: IArticle) => {
        if (env === 'development') {
          console.log('autoSaveEdit saveCallback');
        }
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
      },
    });
  }

  private onEditorChange(textContent: string) {
    if (Math.abs(textContent.length - this.lastSaveLength) > 10) {
      // More frequent local backup
      saveLocalEdit('article', this.articleId, this.readState(false));
    }
    if (Math.abs(textContent.length - this.lastSaveLength) > 50) {
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
            content: this.$t('尚无历史发表存档').toString(),
            color: 'info',
          });
        }
      }
    });
  }

  private loadArchive(archive: IArchive) {
    this.initEditor(archive.body, this.getEditorMode());
    this.historyDialog = false;
  }

  private loadArticleArchive(archive: IArticleArchive) {
    this.articleTitle = archive.title;
    this.initEditor(archive.body, this.getEditorMode());
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
        return;
      }
      if (
        !payload.edit.rendered_body_text ||
        payload.edit.rendered_body_text.length < 5 ||
        !payload.edit.body
      ) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.$store, {
            content: '文章内容太短了，不得少于5个字。',
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
          clearLocalEdit('article', article.uuid);
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
            updated_body_text: payload.edit.rendered_body_text || undefined,
            editor: payload.edit.editor,
            visibility: payload.edit.visibility,
            is_draft: payload.edit.is_draft,
          });
          payload.saveArticleCallback(response.data);
          clearLocalEdit('article', response.data.uuid);
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
    this.showDeleteDraftDialog = false;
    if (this.articleId) {
      await apiArticle.deleteArticleDraft(this.token, this.articleId);
      clearLocalEdit('article', this.articleId);
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

  get chafanTiptap() {
    return this.$refs.tiptap as ChafanTiptap;
  }

  get vditorComponent() {
    return this.$refs.vditor as VditorComponent;
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
}
</script>
