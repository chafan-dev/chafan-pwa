<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': isDesktop }">
        <div>
          <v-overlay v-model="overlay" opacity="0.5" z-index="10">
            <v-progress-circular indeterminate />
          </v-overlay>
          <div class="d-flex justify-end">
            <v-btn class="mr-2" depressed small :href="`/article-columns/${articleColumnId}`">
              返回专栏
            </v-btn>
            <v-btn class="mr-2" depressed small :href="`/articles/${articleId}`">
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
            ref="tiptapRef"
            :onEditorChange="onEditorChange"
            class="mb-2 mt-2"
            placeholder="开始写作"
          />
          <VditorCF
            v-if="editor !== null && body !== null"
            v-show="topLevelEditor === 'vditor'"
            ref="vditorRef"
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
                {{ dayjs.utc(lastAutoSavedAt).local().format('HH:mm:ss') }}
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

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';
import { onBeforeRouteLeave } from 'vue-router/composables';
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
import Viewer from '@/components/Viewer.vue';
import { getVditorUploadConfig, LABS_TIPTAP_EDITOR_OPTION } from '@/common';
import { useAuth, useResponsive, useDayjs } from '@/composables';
import store from '@/store';

// Composables
const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();
const { dayjs, fromNow } = useDayjs();

// Template refs
const tiptapRef = ref<InstanceType<typeof ChafanTiptap> | null>(null);
const vditorRef = ref<any>(null);

// State
const newArticleId = ref<string | null>(null);
const handlingNewEdit = ref(false);
const showHelp = ref(false);
const historyDialog = ref(false);
const overlay = ref(false);
const articleTitle = ref<string | null>(null);
const archivePage = ref(1);
const archivePagesLength = ref(1);
const archivePageLimit = 10;
const writingSessionUUID = uuidv4();
const lastAutoSavedAt = ref<string | null>(null);
const lastSaveLength = ref(0);
const lastSaveIntermediate = ref(false);
const lastSaveTimerId = ref<any>(null);
const articleArchives = ref<IArticleArchive[]>([]);
const showDeleteDraftDialog = ref(false);
const savingIntermediate = ref(false);
const archivesCount = ref<number | undefined>(undefined);
const editor = ref<editor_T | null>(null);
const body = ref<string | null>(null);
const topLevelEditor = ref<'vditor' | 'tiptap'>('vditor');
const topLevelEditorItems = ref<{ text: string; value: string }[] | null>(null);
const formIsDirty = ref(true);

// Computed
const articleColumnId = computed(() => {
  const id = route.query.articleColumnId;
  if (id) {
    return id.toString();
  }
  return null;
});

const articleId = computed(() => {
  const id = route.query.articleId;
  if (id) {
    return id.toString();
  }
  if (newArticleId.value) {
    return newArticleId.value;
  }
  return null;
});

const vditorUploadConfig = computed(() => {
  return getVditorUploadConfig(token.value);
});

// Methods
function getEditorMode(): editor_T {
  if (topLevelEditor.value === 'tiptap') {
    return 'tiptap';
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getMode() ?? 'wysiwyg';
  }
  commitAddNotification(store, {
    content: '编辑器错误',
    color: 'error',
  });
  return 'wysiwyg';
}

function getContent(): string | null {
  if (topLevelEditor.value === 'tiptap') {
    return tiptapRef.value?.getContent() ?? null;
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getContent() ?? null;
  }
  commitAddNotification(store, {
    content: '编辑器错误',
    color: 'error',
  });
  return '';
}

function getTextContent(): string | null {
  if (topLevelEditor.value === 'tiptap') {
    return tiptapRef.value?.getText() ?? null;
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getText() ?? null;
  }
  commitAddNotification(store, {
    content: '编辑器错误',
    color: 'error',
  });
  return null;
}

function readState(isPublished: boolean): IRichEditorState {
  return {
    title: articleTitle.value || '',
    body: getContent(),
    rendered_body_text: getTextContent(),
    is_draft: !isPublished,
    visibility: 'anyone',
    editor: getEditorMode(),
  };
}

function initEditor(bodyContent: string | null, editorMode: editor_T) {
  logDebug(`initEditor(${bodyContent}, ${editorMode}})`);
  if (editorMode === 'tiptap') {
    topLevelEditor.value = 'tiptap';
    if (bodyContent && tiptapRef.value) {
      tiptapRef.value.loadJSON(JSON.parse(bodyContent));
    }
  }
  editor.value = editorMode;
  body.value = bodyContent || '';
}

async function newEditHandler(payload: {
  edit: IRichEditorState;
  isAutosaved: boolean;
  articleId?: string;
  writingSessionUUID: string;
  saveArticleCallback: (article: IArticle) => void;
}) {
  if (handlingNewEdit.value) {
    return;
  }
  handlingNewEdit.value = true;
  await dispatchCaptureApiError(store, async () => {
    if (!payload.edit.title || payload.edit.title.length < 5) {
      if (!payload.isAutosaved) {
        commitAddNotification(store, {
          content: '文章标题太短了，不得少于5个字。',
          color: 'error',
        });
      }
      handlingNewEdit.value = false;
      savingIntermediate.value = false;
      formIsDirty.value = false;
      return;
    }
    if (
      !payload.edit.rendered_body_text ||
      payload.edit.rendered_body_text.length < 1 ||
      !payload.edit.body
    ) {
      if (!payload.isAutosaved) {
        commitAddNotification(store, {
          content: '文章内容太短了，不得少于5个字。',
          color: 'error',
        });
      }
      handlingNewEdit.value = false;
      savingIntermediate.value = false;
      formIsDirty.value = false;
      return;
    }
    if (articleColumnId.value !== null && !articleId.value && !payload.articleId) {
      // new article to question
      const article = await newArticleHandler(
        { token: token.value, store, router },
        payload.edit,
        payload.writingSessionUUID,
        payload.isAutosaved,
        articleColumnId.value
      );
      if (article) {
        payload.saveArticleCallback(article);
        clearLocalEdit('article', article.uuid);
        newArticleId.value = article.uuid;
        if (!payload.isAutosaved) {
          commitAddNotification(store, {
            content: payload.edit.is_draft ? '草稿已保存' : '已发表',
            color: 'success',
          });
        }
      }
    } else if (
      articleColumnId.value !== null &&
      (articleId.value || payload.articleId) &&
      payload.edit.title
    ) {
      const currentArticleId = articleId.value ? articleId.value : payload.articleId;
      if (currentArticleId) {
        newArticleId.value = currentArticleId;
        const response = await apiArticle.updateArticle(token.value, currentArticleId, {
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
          commitAddNotification(store, {
            content: payload.edit.is_draft ? '文章草稿已更新' : '更新已发表',
            color: 'success',
          });
        }
      }
    }
    handlingNewEdit.value = false;
  });
  savingIntermediate.value = false;
}

function autoSaveEdit() {
  newEditHandler({
    isAutosaved: true,
    articleId: articleId.value ? articleId.value : undefined,
    edit: readState(false),
    writingSessionUUID: writingSessionUUID,
    saveArticleCallback: (article: IArticle) => {
      logDebug('autoSaveEdit saveCallback');
      newArticleId.value = article.uuid;
      if (article.draft_saved_at) {
        lastAutoSavedAt.value = article.draft_saved_at;
      } else {
        lastAutoSavedAt.value = article.updated_at;
      }
    },
  });
}

function submitEdit(isPublished: boolean) {
  savingIntermediate.value = true;
  return newEditHandler({
    isAutosaved: false,
    edit: readState(isPublished),
    articleId: articleId.value ? articleId.value : undefined,
    writingSessionUUID: writingSessionUUID,
    saveArticleCallback: (article: IArticle) => {
      lastAutoSavedAt.value = article.updated_at;
      if (isPublished) {
        formIsDirty.value = false;
      }
    },
  });
}

function doAutoSave(textContent: string) {
  if (!lastSaveIntermediate.value) {
    lastSaveIntermediate.value = true;
    lastSaveLength.value = textContent.length;
    autoSaveEdit();
    if (lastSaveTimerId.value !== null) {
      clearTimeout(lastSaveTimerId.value);
    }
    lastSaveTimerId.value = setTimeout(() => {
      lastSaveIntermediate.value = false;
    }, 5000);
  }
}

function onEditorChange(textContent: string) {
  // Auto save if changed a lot
  if (Math.abs(textContent.length - lastSaveLength.value) > 50) {
    doAutoSave(textContent);
  } else {
    // Auto save if not changing for a while
    lastSaveTimerId.value = setTimeout(() => {
      doAutoSave(textContent);
    }, 3000);
  }
  if (Math.abs(textContent.length - lastSaveLength.value) > 10) {
    // More frequent local backup
    saveLocalEdit('article', articleId.value, readState(false));
  }
}

async function showHistoryDialog() {
  await dispatchCaptureApiError(store, async () => {
    if (articleId.value) {
      articleArchives.value = (
        await apiArticle.getArticleArchives(token.value, articleId.value, 0, archivePageLimit)
      ).data;
      if (articleArchives.value.length > 0) {
        historyDialog.value = true;
      } else {
        commitAddNotification(store, {
          content: '尚无历史发表存档',
          color: 'info',
        });
      }
    }
  });
}

function loadArticleArchive(archive: IArticleArchive) {
  articleTitle.value = archive.title;
  initEditor(archive.content.source, getEditorMode());
  historyDialog.value = false;
}

async function changeArchivePage() {
  await dispatchCaptureApiError(store, async () => {
    if (articleId.value) {
      articleArchives.value = (
        await apiArticle.getArticleArchives(
          token.value,
          articleId.value,
          (archivePage.value - 1) * archivePageLimit,
          archivePageLimit
        )
      ).data;
    }
  });
}

async function deleteDraft() {
  showDeleteDraftDialog.value = false;
  if (articleId.value) {
    await apiArticle.deleteArticleDraft(token.value, articleId.value);
    clearLocalEdit('article', articleId.value);
    commitAddNotification(store, {
      content: '草稿已删除',
      color: 'success',
    });
    await router.push(`/articles/${articleId.value}`);
  } else {
    commitAddNotification(store, {
      content: '无法删除草稿',
      color: 'success',
    });
  }
}

function onChangeTopLevelEditor() {
  if (vditorRef.value && tiptapRef.value) {
    if (topLevelEditor.value === 'tiptap') {
      const oldContent = vditorRef.value.getHTML();
      tiptapRef.value.loadHTML(oldContent);
    } else {
      const oldContent = tiptapRef.value.getHTML();
      vditorRef.value.init('wysiwyg', undefined, oldContent);
    }
  }
}

// Navigation guard helpers
function confirmLeave() {
  return window.confirm('确认离开？');
}

function confirmStayInDirtyForm() {
  return formIsDirty.value && !confirmLeave();
}

function beforeWindowUnload(e: BeforeUnloadEvent) {
  if (confirmStayInDirtyForm()) {
    e.preventDefault();
    e.returnValue = '';
  }
}

// Lifecycle
onMounted(async () => {
  let workingDraft: IRichEditorState | null = null;
  if (articleId.value) {
    const article: IArticle = (await apiArticle.getArticle(token.value, articleId.value)).data;
    archivesCount.value = article.archives_count;
    const articleDraft = await getArticleDraft(dayjs, token.value, article.uuid);
    if (articleDraft) {
      logDebug('载入最近的草稿');
      commitAddNotification(store, {
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
    articleTitle.value = workingDraft.title || '';
    initEditor(workingDraft.body, workingDraft.editor);
    lastSaveLength.value = workingDraft.body.length;
  } else {
    initEditor(null, 'wysiwyg');
  }

  if (archivesCount.value !== undefined) {
    archivePagesLength.value = Math.ceil(archivesCount.value / archivePageLimit);
  }

  const editorItems = [
    {
      text: 'Vditor 编辑器',
      value: 'vditor',
    },
  ];
  if (userProfile.value?.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION)) {
    editorItems.push({
      text: 'Tiptap 编辑器',
      value: 'tiptap',
    });
  }
  topLevelEditorItems.value = editorItems;

  window.addEventListener('beforeunload', beforeWindowUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeWindowUnload);
});

// Route leave guard
onBeforeRouteLeave((to, from, next) => {
  if (formIsDirty.value && confirmStayInDirtyForm()) {
    next(false);
  } else {
    next();
  }
});
</script>
