<template>
  <div class="mb-3">
    <DebugSpan>questionIdProp: {{ questionIdProp }}</DebugSpan>
    <template v-if="contentLoaded">
      <ChafanTiptap
        v-show="topLevelEditor === 'tiptap'"
        ref="tiptap"
        :class="{ 'mt-2': focusMode }"
        :initial-content="topLevelEditor === 'tiptap' ? initialContent : undefined"
        :onEditorChange="onEditorChange"
        class="mb-2"
        placeholder="谢谢你的贡献！发言前别忘了社区行为守则"
      />

      <VditorCF
        v-show="topLevelEditor === 'vditor'"
        ref="vditor"
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
        depressed
        small
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
          depressed
          small
          @click="submitEdit(false)"
        >
          保存草稿
        </v-btn>
      </span>

      <v-btn class="ml-2" depressed small @click="$emit('cancel-edit')">取消</v-btn>
      <v-btn class="ml-2" depressed small @click="showHelp = !showHelp">帮助</v-btn>
      <v-progress-circular
        v-if="savingIntermediate"
        class="ml-2"
        color="primary"
        indeterminate
        size="20"
      />
      <v-spacer />
      <span v-if="lastAutoSavedAt && isDesktop && isAuthor" class="mr-2 text-caption grey--text">
        自动保存于
        {{ $dayjs.utc(lastAutoSavedAt).local().format('HH:mm:ss') }}
      </span>
      <DebugSpan>formIsDirty={{ formIsDirty }}</DebugSpan>

      <v-tooltip v-if="answerId && isAuthor" bottom>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="d-flex">
            <HistoryIcon class="ml-2" @click="showHistoryDialog" />
          </div>
        </template>
        <span>版本历史</span>
      </v-tooltip>

      <v-menu :close-on-content-click="false" offset-y top v-if="isAuthor">
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
          <v-list-item>
            <v-list-item-icon class="pl-1 pt-2">
              <RegisteredVisibilityIcon v-if="visibility === 'registered'" />
              <AnyoneVisibilityIcon v-else-if="visibility === 'anyone'" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-select
                v-model="visibility"
                :items="visibilityItems"
                dense
                item-text="text"
                item-value="value"
              />
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="topLevelEditorItems !== null">
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

          <v-expansion-panels v-if="archives">
            <v-expansion-panel v-for="archive in archives" :key="archive.id">
              <v-expansion-panel-header>
                <v-btn class="mr-4" depressed max-width="100px" small @click="loadArchive(archive)">
                  加载该版本
                </v-btn>
                {{ fromNow(archive.created_at) }}
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

<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import AnyoneVisibilityIcon from '@/components/icons/AnyoneVisibilityIcon.vue';
import RegisteredVisibilityIcon from '@/components/icons/RegisteredVisibilityIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { readWorkingDraft } from '@/store/main/getters';
import { clearLocalEdit, logDebug, saveLocalEdit, uuidv4 } from '@/utils';
import {
  editor_T,
  IAnswer,
  IAnswerArchive,
  IAnswerSuggestEdit,
  IRichEditorState,
} from '@/interfaces';
import { apiAnswer } from '@/api/answer';

import { dispatchCaptureApiError } from '@/store/main/actions';
import { VditorCF } from 'chafan-vue-editors';
import EditIcon from '@/components/icons/EditIcon.vue';
import { CVue, getVditorUploadConfig, LABS_TIPTAP_EDITOR_OPTION } from '@/common';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { AnswerEditHandler } from '@/handlers';
import EditorHelp from '@/components/editor/EditorHelp.vue';
import { Route } from 'vue-router';
import DebugSpan from '@/components/base/DebugSpan.vue';

@Component({
  components: {
    DebugSpan,
    EditorHelp,
    ChafanTiptap,
    EditIcon,
    VditorCF,
    HistoryIcon,
    DeleteIcon,
    SettingsIcon,
    AnyoneVisibilityIcon,
    RegisteredVisibilityIcon,
  },
})
export default class AnswerEditor extends CVue {
  // Events:
  // - cancel-edit
  // - updated-answer
  // - delete-draft

  @Prop({ default: false }) private readonly focusMode!: boolean;
  @Prop() private readonly answerIdProp: string | undefined;
  @Prop() private readonly questionIdProp!: string;
  @Prop({ default: false }) private readonly inPrivateSite!: boolean;
  @Prop({ default: true }) private readonly isAuthor!: boolean;
  @Prop() private readonly archivesCount: number | undefined;
  @Prop() private readonly submitAnswerSuggestEditCallback:
    | ((edit: IAnswerSuggestEdit) => void)
    | undefined;

  private topLevelEditorItems: { text: string; value: string }[] | null = null;
  private readonly visibilityItems = [
    {
      text: '仅注册用户可读',
      value: 'registered',
    },
  ].concat(
    this.inPrivateSite
      ? []
      : [
          {
            text: '公开可读',
            value: 'anyone',
          },
        ]
  );
  private visibility: 'anyone' | 'registered' = this.inPrivateSite ? 'registered' : 'anyone';
  private showHelp = false;
  private historyDialog = false;
  private answerId: string | null = null;
  private archivePage = 1;
  private archivePagesLength = 1;
  private readonly archivePageLimit = 10;
  // prevent double-posting
  private writingSessionUUID = uuidv4();
  private lastAutoSavedAt: string | null = null;
  private lastSaveLength = 0;
  private lastSaveIntermediate = false;
  private lastSaveTimerId: any = null;
  private archives: IAnswerArchive[] = [];
  private showDeleteDraftDialog = false;
  private topLevelEditor: 'tiptap' | 'vditor' = 'vditor';
  private savingIntermediate: boolean = false;
  private contentLoaded: boolean = false;
  private initialContent: string = '';
  private contentEditor: editor_T = 'wysiwyg';
  private answerEditHandler: AnswerEditHandler | null = null;
  private answerSuggestEditComment: string | null = null;

  private invalidAnswerCallback() {
    logDebug('invalid answer');
    this.savingIntermediate = false;
    this.formIsDirty = false;
  }

  // For local edit saving identification
  get contentId() {
    if (this.answerId) {
      return this.answerId;
    }
    if (this.questionIdProp) {
      return 'answer-of-' + this.questionIdProp;
    }
    return null;
  }
  get vditorUploadConfig() {
    return getVditorUploadConfig(this.token);
  }

  @Emit('delete-draft')
  async deleteDraft() {
    this.showDeleteDraftDialog = false;
    clearLocalEdit('answer', this.contentId);
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answerId) {
        await apiAnswer.deleteAnswerDraft(this.token, this.answerId);
        commitAddNotification(this.$store, {
          content: '草稿已删除',
          color: 'success',
        });
      }
    });
  }

  private mounted() {
    this.answerEditHandler = new AnswerEditHandler(
      this,
      this.answerId,
      this.questionIdProp,
      this.updatedAnswerCallback,
      undefined,
      this.invalidAnswerCallback
    );
    this.answerId = this.answerIdProp ? this.answerIdProp : null;
    const workingDraft = readWorkingDraft(this.$store);
    if (workingDraft && workingDraft.body) {
      this.visibility = workingDraft.visibility;
      this.initEditor(workingDraft.body, workingDraft.editor);
      this.lastSaveLength = workingDraft.body.length;
    } else {
      this.initEditor(null, this.userProfile!.default_editor_mode);
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
    const userProfile = this.userProfile;
    if (userProfile!.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION)) {
      topLevelEditorItems.push({
        text: 'Tiptap 编辑器',
        value: 'tiptap',
      });
    }
    if (topLevelEditorItems.length > 1) {
      this.topLevelEditorItems = topLevelEditorItems;
    }
  }

  private getEditorMode(): editor_T {
    if (this.topLevelEditor === 'tiptap') {
      return 'tiptap';
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as any).getMode();
    }
    commitAddNotification(this.$store, {
      content: '编辑器错误',
      color: 'error',
    });
    return 'wysiwyg';
  }

  private getContent(): string | null {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as ChafanTiptap).getContent();
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
      return (this.$refs.tiptap as ChafanTiptap).getText();
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
      body: this.getContent(),
      rendered_body_text: this.getTextContent(),
      is_draft: !isPublished,
      visibility: this.visibility,
      editor: this.getEditorMode(),
    };
  }

  private initEditor(body: string | null, editor: editor_T) {
    if (editor === 'tiptap') {
      this.topLevelEditor = 'tiptap';
    } else {
      this.topLevelEditor = 'vditor';
    }
    this.contentEditor = editor;
    this.initialContent = body || '';
    this.contentLoaded = true;
  }

  private autoSaveEdit() {
    if (!this.answerEditHandler) {
      return;
    }
    this.answerEditHandler.newEditHandler(
      {
        isAutosaved: true,
        answerId: this.answerId ? this.answerId : undefined,
        edit: this.readState(false),
        writingSessionUUID: this.writingSessionUUID,
        saveCallback: (answer: IAnswer) => {
          logDebug('autoSaveEdit saveCallback');
          this.answerId = answer.uuid;
          if (answer.draft_saved_at) {
            this.lastAutoSavedAt = answer.draft_saved_at;
          } else {
            this.lastAutoSavedAt = answer.updated_at;
          }
        },
      },
      this.isAuthor
    );
  }

  @Emit('updated-answer')
  private updatedAnswerCallback(answer: IAnswer, isAutoSaved: boolean) {
    return {
      answer,
      isAutoSaved,
    };
  }

  private submitEdit(isPublished: boolean) {
    this.savingIntermediate = true;
    if (!this.answerEditHandler) {
      return;
    }
    this.answerEditHandler.newEditHandler(
      {
        isAutosaved: false,
        edit: this.readState(isPublished),
        answerId: this.answerId ? this.answerId : undefined,
        writingSessionUUID: this.writingSessionUUID,
        saveCallback: (answer: IAnswer) => {
          if (this.answerId) {
            clearLocalEdit('answer', 'answer-of-' + this.answerId);
          }
          clearLocalEdit('answer', 'answer-of-' + this.questionIdProp);
          this.lastAutoSavedAt = answer.updated_at;
          if (isPublished) {
            this.formIsDirty = false;
          }
        },
        answerSuggestEditComment: this.answerSuggestEditComment
          ? this.answerSuggestEditComment
          : undefined,
        submitAnswerSuggestEditCallback: this.submitAnswerSuggestEditCallback,
      },
      this.isAuthor
    );
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

  private onEditorChange(textContent: string) {
    if (!this.isAuthor) {
      return;
    }
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
      saveLocalEdit('answer', this.contentId, this.readState(false));
      this.lastSaveLength = textContent.length;
    }
    logDebug('onEditorChange textContent: ' + textContent);
  }

  private async showHistoryDialog() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answerId) {
        this.archives = (
          await apiAnswer.getAnswerArchives(this.token, this.answerId, 0, this.archivePageLimit)
        ).data;
        if (this.archives.length > 0) {
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

  private loadArchive(archive: IAnswerArchive) {
    this.initEditor(archive.content.source, this.getEditorMode());
    this.historyDialog = false;
  }

  private async changeArchivePage() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answerId) {
        this.archives = (
          await apiAnswer.getAnswerArchives(
            this.token,
            this.answerId,
            (this.archivePage - 1) * this.archivePageLimit,
            this.archivePageLimit
          )
        ).data;
      }
    });
  }

  private onChangeTopLevelEditor() {
    if (this.topLevelEditor === 'tiptap') {
      const oldContent = (this.$refs.vditor as any).getHTML();
      this.contentEditor = 'tiptap';
      (this.$refs.tiptap as ChafanTiptap).loadHTML(oldContent);
    } else if (this.topLevelEditor === 'vditor') {
      const oldContent = (this.$refs.tiptap as ChafanTiptap).getHTML();
      this.contentEditor = 'wysiwyg';
      (this.$refs.vditor as any).init('wysiwyg', undefined, oldContent);
    }
  }

  private formIsDirty = true;
  // duplicated in answer editor
  beforeRouteLeave(to: Route, from: Route, next: (boolean?) => void) {
    // If the form is dirty and the user did not confirm leave,
    // prevent losing unsaved changes by canceling navigation
    logDebug('beforeRouteLeave formIsDirty = ' + this.formIsDirty);
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
