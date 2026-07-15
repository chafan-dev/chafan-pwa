<template>
  <div class="mb-3">
    <DebugSpan>questionIdProp: {{ questionIdProp }}</DebugSpan>
    <template v-if="contentLoaded">
      <ChafanTiptap
        v-show="topLevelEditor === 'tiptap'"
        ref="tiptapRef"
        :class="{ 'mt-2': focusMode }"
        :initial-content="topLevelEditor === 'tiptap' ? initialContent : undefined"
        :onEditorChange="onEditorChange"
        class="mb-2"
        placeholder="谢谢你的贡献！发言前别忘了社区行为守则"
      />

      <VditorCF
        v-show="topLevelEditor === 'vditor'"
        ref="vditorRef"
        :class="{ 'mt-2': focusMode }"
        :editorMode="contentEditor"
        :initial-content="topLevelEditor === 'vditor' ? initialContent : undefined"
        :isMobile="!isDesktop"
        :onEditorChange="onEditorChange"
        :vditorUploadConfig="vditorUploadConfig"
        class="mb-2"
        placeholder="谢谢你的贡献！发言前别忘了社区行为守则"
      />
    </template>

    <!-- Editor controls -->
    <div class="d-flex align-center">
      <v-btn
        :disabled="savingIntermediate"
        color="primary"
        variant="flat"
        size="small"
        @click="submitEdit(true)"
      >
        <template v-if="isAuthor"> 发表答案 </template>
        <template v-else> 提交建议 </template>
      </v-btn>

      <span class="ml-2" v-if="isAuthor">
        <!-- NOTE: wrap in span to avoid ml-2 problem when disabled during progress -->
        <v-btn
          :disabled="savingIntermediate"
          color="info"
          variant="flat"
          size="small"
          @click="submitEdit(false)"
        >
          保存草稿
        </v-btn>
      </span>

      <v-btn class="ml-2" variant="tonal" size="small" @click="emit('cancel-edit')">取消</v-btn>
      <v-btn class="ml-2" variant="tonal" size="small" @click="showHelp = !showHelp">帮助</v-btn>
      <v-progress-circular
        v-if="savingIntermediate"
        class="ml-2"
        color="primary"
        indeterminate
        size="20"
      />
      <v-spacer />
      <span v-if="lastAutoSavedAt && isDesktop && isAuthor" class="mr-2 text-caption text-grey">
        自动保存于
        {{ dayjs.utc(lastAutoSavedAt).local().format('HH:mm:ss') }}
      </span>
      <DebugSpan>formIsDirty={{ formIsDirty }}</DebugSpan>

      <v-tooltip v-if="answerId && isAuthor" location="bottom">
        <template v-slot:activator="{ props }">
          <div v-bind="props" class="d-flex">
            <AppIcon name="History" class="ml-2" @click="showHistoryDialog"  />
          </div>
        </template>
        <span>版本历史</span>
      </v-tooltip>

      <v-menu :close-on-content-click="false" location="top" v-if="isAuthor">
        <template v-slot:activator="{ props }">
          <AppIcon name="Settings" v-bind="props" class="ml-1"  />
        </template>
        <v-list density="compact">
          <v-list-item @click="showDeleteDraftDialog = true">
            <template v-slot:prepend>
              <AppIcon name="Delete"  />
            </template>
            <div>删除</div>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <AppIcon name="RegisteredVisibility" v-if="visibility === 'registered'"  />
              <AppIcon name="AnyoneVisibility" v-else-if="visibility === 'anyone'"  />
            </template>
            <div>
              <v-select
                v-model="visibility"
                :items="visibilityItems"
                density="compact"
                item-text="text"
                item-value="value"
              />
            </div>
          </v-list-item>
          <v-list-item v-if="topLevelEditorItems !== null">
            <template v-slot:prepend>
              <AppIcon name="Edit"  />
            </template>
            <div>
              <v-select
                v-model="topLevelEditor"
                :items="topLevelEditorItems"
                density="compact"
                item-text="text"
                item-value="value"
                @change="onChangeTopLevelEditor"
              />
            </div>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-dialog v-model="showDeleteDraftDialog" max-width="400">
        <v-card>
          <v-card-title> 删除当前草稿？</v-card-title>
          <v-card-text> 不影响已发表版本</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="warning" @click="deleteDraft">确认</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="historyDialog" max-width="900">
        <v-card>
          <v-card-title>
            <div class="text-h5 text-primary">版本历史</div>
            <v-spacer />
            <span class="text-caption text-grey">点击展开</span>
          </v-card-title>

          <v-expansion-panels v-if="archives">
            <v-expansion-panel v-for="archive in archives" :key="archive.id">
              <v-expansion-panel-header>
                <v-btn class="mr-4" variant="tonal" max-width="100px" size="small" @click="loadArchive(archive)">
                  加载该版本
                </v-btn>
                <RelativeTime :datetime="archive.created_at" />
                <v-spacer />
              </v-expansion-panel-header>
              <v-expansion-panel-content>
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

    <v-textarea
      v-if="!isAuthor"
      class="mt-2"
      label="答案改动建议附言"
      v-model="answerSuggestEditComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { clearLocalEdit, logDebug, saveLocalEdit, uuidv4 } from '@/utils';
import {
  editor_T,
  IAnswer,
  IAnswerArchive,
  IAnswerSuggestEdit,
  IRichEditorState,
} from '@/interfaces';
import { apiAnswer } from '@/api/answer';
import VditorCF from '@/editors/lib-components/VditorCF.vue';
import { getVditorUploadConfig, LABS_TIPTAP_EDITOR_OPTION } from '@/common';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { AnswerEditHandler } from '@/handlers';
import EditorHelp from '@/components/editor/EditorHelp.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import Viewer from '@/components/Viewer.vue';
import RelativeTime from '@/components/RelativeTime.vue';
import dayjs from '@/dayjs';
import { useAuth, useResponsive } from '@/composables';
import { useMainStore } from '@/stores/main';
import { useUiStore } from '@/stores/ui';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useNotificationStore } from '@/stores/notifications';
const store = useMainStore();
const ui = useUiStore();

const props = withDefaults(defineProps<{
  focusMode?: boolean;
  answerIdProp?: string;
  questionIdProp: string;
  inPrivateSite?: boolean;
  isAuthor?: boolean;
  archivesCount?: number;
  submitAnswerSuggestEditCallback?: (edit: IAnswerSuggestEdit) => void;
}>(), {
  focusMode: false,
  inPrivateSite: false,
  isAuthor: true,
});

const emit = defineEmits<{
  (e: 'cancel-edit'): void;
  (e: 'updated-answer', payload: { answer: IAnswer; isAutoSaved: boolean }): void;
  (e: 'delete-draft'): void;
}>();

const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();

// Template refs
const tiptapRef = ref<InstanceType<typeof ChafanTiptap> | null>(null);
const vditorRef = ref<any>(null);

// State
const visibilityItems = computed(() => {
  const items = [{ text: '仅注册用户可读', value: 'registered' }];
  if (!props.inPrivateSite) {
    items.push({ text: '公开可读', value: 'anyone' });
  }
  return items;
});
const visibility = ref<'anyone' | 'registered'>(props.inPrivateSite ? 'registered' : 'anyone');
const showHelp = ref(false);
const historyDialog = ref(false);
const answerId = ref<string | null>(props.answerIdProp || null);
const archivePage = ref(1);
const archivePagesLength = ref(1);
const archivePageLimit = 10;
const writingSessionUUID = uuidv4();
const lastAutoSavedAt = ref<string | null>(null);
const lastSaveLength = ref(0);
const lastSaveIntermediate = ref(false);
const lastSaveTimerId = ref<any>(null);
const archives = ref<IAnswerArchive[]>([]);
const showDeleteDraftDialog = ref(false);
const topLevelEditor = ref<'tiptap' | 'vditor'>('vditor');
const savingIntermediate = ref(false);
const contentLoaded = ref(false);
const initialContent = ref('');
const contentEditor = ref<editor_T>('wysiwyg');
const answerEditHandler = ref<AnswerEditHandler | null>(null);
const answerSuggestEditComment = ref<string | null>(null);
const topLevelEditorItems = ref<{ text: string; value: string }[] | null>(null);
const formIsDirty = ref(true);

const contentId = computed(() => {
  if (answerId.value) {
    return answerId.value;
  }
  if (props.questionIdProp) {
    return 'answer-of-' + props.questionIdProp;
  }
  return null;
});

const vditorUploadConfig = computed(() => getVditorUploadConfig(token.value));

function invalidAnswerCallback() {
  logDebug('invalid answer');
  savingIntermediate.value = false;
  formIsDirty.value = false;
}

function updatedAnswerCallback(answer: IAnswer, isAutoSaved: boolean) {
  emit('updated-answer', { answer, isAutoSaved });
}

async function deleteDraft() {
  showDeleteDraftDialog.value = false;
  clearLocalEdit('answer', contentId.value);
  await store.captureApiError(async () => {
    if (answerId.value) {
      await apiAnswer.deleteAnswerDraft(token.value, answerId.value);
      useNotificationStore().push({
        content: '草稿已删除',
        color: 'success',
      });
    }
  });
  emit('delete-draft');
}

onMounted(() => {
  answerEditHandler.value = new AnswerEditHandler(
    { token, userProfile, $router: null } as any,
    answerId.value,
    props.questionIdProp,
    updatedAnswerCallback,
    undefined,
    invalidAnswerCallback
  );

  const workingDraft = ui.workingDraft;
  if (workingDraft && workingDraft.body) {
    visibility.value = workingDraft.visibility;
    initEditor(workingDraft.body, workingDraft.editor);
    lastSaveLength.value = workingDraft.body.length;
  } else {
    initEditor(null, userProfile.value!.default_editor_mode);
  }

  if (props.archivesCount !== undefined) {
    archivePagesLength.value = Math.ceil(props.archivesCount / archivePageLimit);
  }

  const editorItems = [{ text: 'Vditor 编辑器', value: 'vditor' }];
  if (userProfile.value!.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION)) {
    editorItems.push({ text: 'Tiptap 编辑器', value: 'tiptap' });
  }
  if (editorItems.length > 1) {
    topLevelEditorItems.value = editorItems;
  }

  window.addEventListener('beforeunload', beforeWindowUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeWindowUnload);
});

function getEditorMode(): editor_T {
  if (topLevelEditor.value === 'tiptap') {
    return 'tiptap';
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getMode() || 'wysiwyg';
  }
  useNotificationStore().push({
    content: '编辑器错误',
    color: 'error',
  });
  return 'wysiwyg';
}

function getContent(): string | null {
  if (topLevelEditor.value === 'tiptap') {
    return tiptapRef.value?.getContent() || null;
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getContent() || null;
  }
  useNotificationStore().push({
    content: '编辑器错误',
    color: 'error',
  });
  return '';
}

function getTextContent(): string | null {
  if (topLevelEditor.value === 'tiptap') {
    return tiptapRef.value?.getText() || null;
  } else if (topLevelEditor.value === 'vditor') {
    return vditorRef.value?.getText() || null;
  }
  useNotificationStore().push({
    content: '编辑器错误',
    color: 'error',
  });
  return null;
}

function readState(isPublished: boolean): IRichEditorState {
  return {
    body: getContent(),
    rendered_body_text: getTextContent(),
    is_draft: !isPublished,
    visibility: visibility.value,
    editor: getEditorMode(),
  };
}

function initEditor(body: string | null, editor: editor_T) {
  if (editor === 'tiptap') {
    topLevelEditor.value = 'tiptap';
  } else {
    topLevelEditor.value = 'vditor';
  }
  contentEditor.value = editor;
  initialContent.value = body || '';
  contentLoaded.value = true;
}

function autoSaveEdit() {
  if (!answerEditHandler.value) {
    return;
  }
  answerEditHandler.value.newEditHandler(
    {
      isAutosaved: true,
      answerId: answerId.value ? answerId.value : undefined,
      edit: readState(false),
      writingSessionUUID,
      saveCallback: (answer: IAnswer) => {
        logDebug('autoSaveEdit saveCallback');
        answerId.value = answer.uuid;
        if (answer.draft_saved_at) {
          lastAutoSavedAt.value = answer.draft_saved_at;
        } else {
          lastAutoSavedAt.value = answer.updated_at;
        }
      },
    },
    props.isAuthor
  );
}

function submitEdit(isPublished: boolean) {
  savingIntermediate.value = true;
  if (!answerEditHandler.value) {
    return;
  }
  answerEditHandler.value.newEditHandler(
    {
      isAutosaved: false,
      edit: readState(isPublished),
      answerId: answerId.value ? answerId.value : undefined,
      writingSessionUUID,
      saveCallback: (answer: IAnswer) => {
        if (answerId.value) {
          clearLocalEdit('answer', 'answer-of-' + answerId.value);
        }
        clearLocalEdit('answer', 'answer-of-' + props.questionIdProp);
        lastAutoSavedAt.value = answer.updated_at;
        if (isPublished) {
          formIsDirty.value = false;
        }
      },
      answerSuggestEditComment: answerSuggestEditComment.value
        ? answerSuggestEditComment.value
        : undefined,
      submitAnswerSuggestEditCallback: props.submitAnswerSuggestEditCallback,
    },
    props.isAuthor
  );
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
  if (!props.isAuthor) {
    return;
  }
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
    saveLocalEdit('answer', contentId.value, readState(false));
    lastSaveLength.value = textContent.length;
  }
  logDebug('onEditorChange textContent: ' + textContent);
}

async function showHistoryDialog() {
  await store.captureApiError(async () => {
    if (answerId.value) {
      archives.value = (
        await apiAnswer.getAnswerArchives(token.value, answerId.value, 0, archivePageLimit)
      ).data;
      if (archives.value.length > 0) {
        historyDialog.value = true;
      } else {
        useNotificationStore().push({
          content: '尚无历史发表存档',
          color: 'info',
        });
      }
    }
  });
}

function loadArchive(archive: IAnswerArchive) {
  initEditor(archive.content.source, getEditorMode());
  historyDialog.value = false;
}

async function changeArchivePage() {
  await store.captureApiError(async () => {
    if (answerId.value) {
      archives.value = (
        await apiAnswer.getAnswerArchives(
          token.value,
          answerId.value,
          (archivePage.value - 1) * archivePageLimit,
          archivePageLimit
        )
      ).data;
    }
  });
}

function onChangeTopLevelEditor() {
  if (topLevelEditor.value === 'tiptap') {
    const oldContent = vditorRef.value?.getHTML() || '';
    contentEditor.value = 'tiptap';
    tiptapRef.value?.loadHTML(oldContent);
  } else if (topLevelEditor.value === 'vditor') {
    const oldContent = tiptapRef.value?.getHTML() || '';
    contentEditor.value = 'wysiwyg';
    vditorRef.value?.init('wysiwyg', undefined, oldContent);
  }
}

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

onBeforeRouteLeave((to, from, next) => {
  logDebug('beforeRouteLeave formIsDirty = ' + formIsDirty.value);
  if (formIsDirty.value && confirmStayInDirtyForm()) {
    next(false);
  } else {
    next();
  }
});

defineExpose({
  deleteDraft,
});
</script>
