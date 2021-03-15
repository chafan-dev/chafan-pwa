<template>
  <div
    :class="{
      'd-flex': true,
      'flex-column': true,
      'flex-column-reverse': focusMode,
    }"
  >
    <v-overlay v-model="overlay" opacity="0.5" z-index="10">
      <v-progress-circular indeterminate />
    </v-overlay>
    <div id="vditor" class="mb-2" :class="{ 'mt-2': focusMode }" />
    <div class="d-flex align-center">
      <v-btn small depressed color="slim-btn primary" @click="submitEdit(true)">
        {{ $t(publishText) }}
      </v-btn>
      <v-btn small depressed color="slim-btn info ml-2" @click="submitEdit(false)">
        {{ $t('Save draft') }}
      </v-btn>
      <v-btn small depressed class="slim-btn ml-2" @click="$emit('cancel-edit')">{{
        $t('Cancel')
      }}</v-btn>
      <v-btn small depressed class="slim-btn ml-2" @click="showHelp = !showHelp">{{
        $t('Help')
      }}</v-btn>
      <v-spacer />
      <span
        class="mr-2 text-caption grey--text"
        v-if="lastAutoSavedAt && $vuetify.breakpoint.mdAndUp"
      >
        {{ $t('自动保存于') }}
        {{ $dayjs.utc(lastAutoSavedAt).local().fromNow() }}
      </span>

      <v-tooltip bottom v-if="answerId || articleId">
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" align-self="center" class="d-flex">
            <HistoryIcon class="ml-2" @click="showHistoryDialog" />
          </div>
        </template>
        <span>{{ $t('版本历史') }}</span>
      </v-tooltip>

      <v-menu offset-y top v-if="answerId || articleId" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <SettingsIcon v-bind="attrs" v-on="on" />
        </template>
        <v-list dense>
          <v-list-item @click="showDeleteDraftDialog = true">
            <v-list-item-icon>
              <DeleteIcon />
            </v-list-item-icon>
            <v-list-item-content>{{ $t('删除') }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="pl-1 pt-2">
              <RegisteredVisibilityIcon v-if="visibility === 'registered'" />
              <AnyoneVisibilityIcon v-else-if="visibility === 'anyone'" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-select
                dense
                :items="visibilityItems"
                v-model="visibility"
                item-text="text"
                item-value="value"
              />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-dialog max-width="400" v-model="showDeleteDraftDialog">
        <v-card>
          <v-card-title primary-title>
            {{ $t('删除当前草稿？') }}
          </v-card-title>
          <v-card-text>
            {{ $t('不影响已发表版本') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="warning" @click="deleteDraft">{{ $t('确认') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog max-width="900" v-model="historyDialog">
        <v-card>
          <v-card-title primary-title>
            <div class="headline primary--text">{{ $t('版本历史') }}</div>
            <v-spacer />
            <span class="text-caption grey--text">{{ $t('点击展开') }}</span>
          </v-card-title>

          <v-expansion-panels v-if="archives">
            <v-expansion-panel v-for="archive in archives" :key="archive.id">
              <v-expansion-panel-header>
                <v-btn
                  small
                  depressed
                  max-width="100px"
                  class="mr-4"
                  @click="loadArchive(archive)"
                  >{{ $t('加载该版本') }}</v-btn
                >
                {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                <v-spacer />
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <Viewer :body="archive.body" />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-if="articleArchives">
            <v-expansion-panel v-for="archive in articleArchives" :key="archive.id">
              <v-expansion-panel-header>
                <v-btn
                  small
                  depressed
                  max-width="100px"
                  class="mr-4"
                  @click="loadArticleArchive(archive)"
                  >{{ $t('加载该版本') }}</v-btn
                >
                {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                <v-spacer />
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="title">
                  {{ archive.title }}
                </div>
                <Viewer :body="archive.body" />
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
    <v-expand-transition>
      <v-card class="ma-3 pa-3" v-show="showHelp">
        <div class="headline primary--text">{{ $t('Help') }}</div>
        <div>
          <ul>
            <li>
              数学输入：目前支持用<code>$...$</code>输入行内公式，用<code>$$....$$</code>输入公式块。
            </li>
          </ul>
        </div>
      </v-card>
    </v-expand-transition>
    <div v-if="hasTitle">
      <v-textarea
        :label="$t('Title')"
        auto-grow
        dense
        rows="1"
        class="headline mt-2"
        v-model="articleTitle"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import AnyoneVisibilityIcon from '@/components/icons/AnyoneVisibilityIcon.vue';
import RegisteredVisibilityIcon from '@/components/icons/RegisteredVisibilityIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { readUserProfile, readWorkingDraft } from '@/store/main/getters';
import { uuidv4 } from '@/utils';
import {
  IAnswer,
  IArchive,
  IArticle,
  IArticleArchive,
  INewEditEvent,
  IRichEditorState,
} from '@/interfaces';
import { apiAnswer } from '@/api/answer';
import { apiArticle } from '@/api/article';
import { apiUrl, env } from '@/env';

import Vditor from '@chafan/vditor';
import { vditorCDN } from '@/common';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
  components: {
    HistoryIcon,
    DeleteIcon,
    SettingsIcon,
    AnyoneVisibilityIcon,
    RegisteredVisibilityIcon,
  },
})
export default class RichEditor extends Vue {
  get token() {
    return this.$store.state.main.token;
  }
  @Prop({ default: false }) private readonly focusMode!: boolean;
  @Prop() private readonly answerIdProp: string | undefined;
  @Prop() private readonly articleIdProp: string | undefined;
  @Prop({ default: false }) private readonly inPrivateSite!: boolean;
  @Prop() private readonly archivesCount: number | undefined;
  @Prop({ default: false }) private readonly hasTitle!: boolean;
  @Prop({ default: 'Publish' }) private readonly publishText!: string;

  private format: 'markdown' = 'markdown';
  private mathEnabled = false;
  private readonly visibilityItems = [
    {
      text: this.$t('仅注册用户可读').toString(),
      value: 'registered',
    },
  ].concat(
    this.inPrivateSite
      ? []
      : [
          {
            text: this.$t('公开可读').toString(),
            value: 'anyone',
          },
        ]
  );
  private visibility: 'anyone' | 'registered' = this.inPrivateSite ? 'registered' : 'anyone';
  private showHelp = false;
  private historyDialog = false;
  private answerId: string | null = null;
  private articleId: string | null = null;
  private overlay = false;
  private articleTitle: string | null = null;

  private archivePage = 1;
  private archivePagesLength = 1;
  private readonly archivePageLimit = 10;

  // prevent double-posting
  private writingSessionUUID = uuidv4();

  private vditor: Vditor | null = null;

  private lastAutoSavedAt: string | null = null;

  private lastSaveLength = 0;
  private lastSaveIntermediate = false;
  private lastSaveTimerId: number | null = null;

  private archives: IArchive[] = [];
  private selectedArchive: IArchive | null = null;

  private articleArchives: IArticleArchive[] = [];
  private selectedArticleArchive: IArticleArchive | null = null;

  private allToolbarItems: any[] = [
    'emoji',
    'headings',
    'bold',
    'italic',
    'strike',
    {
      name: 'link',
      suffix: ']()',
    },
    '|',
    'list',
    'ordered-list',
    'check',
    'outdent',
    'indent',
    '|',
    'quote',
    'line',
    'code',
    'inline-code',
    'insert-before',
    'insert-after',
    '|',
    {
      name: 'upload',
      tip: '上传图片',
    },
    'table',
    '|',
    'undo',
    'redo',
    '|',
    'fullscreen',
    'edit-mode',
    'both',
    'code-theme',
    'content-theme',
    'export',
    'outline',
    'info',
    'help',
  ];

  private showInMobileToolBar = [
    'headings',
    'bold',
    'italic',
    'link',
    'list',
    'line',
    'upload',
    'fullscreen',
  ];

  private showDeleteDraftDialog = false;

  private mounted() {
    this.answerId = this.answerIdProp ? this.answerIdProp : null;
    this.articleId = this.articleIdProp ? this.articleIdProp : null;
    const workingDraft = readWorkingDraft(this.$store);
    if (workingDraft) {
      this.format = workingDraft.source_format;
      this.mathEnabled = workingDraft.math_enabled;
      this.visibility = workingDraft.visibility;
      this.articleTitle = workingDraft.title;
      this.initEditor(workingDraft.body, workingDraft.editor);
      this.lastSaveLength = workingDraft.body.length;
    } else {
      this.initEditor('', readUserProfile(this.$store)!.default_editor_mode);
    }

    if (this.archivesCount !== undefined) {
      this.archivePagesLength = Math.ceil(this.archivesCount / this.archivePageLimit);
    }
  }

  private getEditorMode(): 'wysiwyg' | 'markdown_splitview' | 'markdown_realtime_rendering' {
    if (this.vditor!.getCurrentMode() === 'wysiwyg') {
      return 'wysiwyg';
    } else if (this.vditor!.getCurrentMode() === 'ir') {
      return 'markdown_realtime_rendering';
    } else {
      return 'markdown_splitview';
    }
  }

  private getContent() {
    return this.vditor!.getValue();
  }

  private getTextContent() {
    let text = '';
    for (const el of this.$el.querySelectorAll('.vditor-content')) {
      text += el.textContent;
    }
    return text;
  }

  private readState(isPublished: boolean): IRichEditorState {
    return {
      title: this.articleTitle,
      body: this.getContent(),
      rendered_body_text: this.getTextContent(),
      source_format: this.format,
      is_draft: !isPublished,
      visibility: this.visibility,
      editor: this.getEditorMode(),
      math_enabled: this.mathEnabled,
    };
  }

  private initEditor(
    body: string,
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering'
  ) {
    let toolBar: any[] = [];
    if (this.$vuetify.breakpoint.mdAndUp) {
      toolBar = this.allToolbarItems.slice(0, this.allToolbarItems.length - 7).concat([
        {
          name: 'more',
          toolbar: this.allToolbarItems.slice(this.allToolbarItems.length - 7),
        },
      ]);
    } else {
      const toolBarMore: any[] = [];
      for (const item of this.allToolbarItems) {
        if (
          this.showInMobileToolBar.includes(item) ||
          this.showInMobileToolBar.includes(item.name)
        ) {
          toolBar.push(item);
        } else if (item !== '|') {
          toolBarMore.push(item);
        }
      }
      toolBar.push({
        name: 'more',
        toolbar: toolBarMore,
      });
    }
    let editorMode: 'wysiwyg' | 'sv' | 'ir';
    if (editor === 'markdown' || editor == 'markdown_realtime_rendering') {
      editorMode = 'ir';
    } else if (editor === 'wysiwyg') {
      editorMode = 'wysiwyg';
    } else {
      editorMode = 'sv';
    }
    this.vditor = new Vditor('vditor', {
      minHeight: 300,
      toolbar: toolBar,
      debugger: env === 'development',
      cdn: vditorCDN,
      preview: {
        mode: 'both',
        actions: [],
      },
      input: (value: string) => {
        this.onEditorChange(value);
      },
      upload: {
        max: 5 * 1024 * 1024,
        // TODO: token for CORS validation
        accept: 'image/png, image/jpeg, image/bmp, image/gif',
        fieldName: 'files',
        url: `${apiUrl}/api/v1/upload/vditor/`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
      mode: editorMode,
      value: body,
      cache: {
        enable: false,
      },
    });
  }

  @Emit('submit-edit')
  private autoSaveEdit(): INewEditEvent {
    if (env === 'development') {
      console.log('autoSaveEdit, this.answerId: ' + this.answerId);
    }
    return {
      isAutosaved: true,
      answerId: this.answerId ? this.answerId : undefined,
      articleId: this.articleId ? this.articleId : undefined,
      edit: this.readState(false),
      writingSessionUUID: this.writingSessionUUID,
      saveCallback: (answer: IAnswer) => {
        if (env === 'development') {
          console.log('autoSaveEdit saveCallback');
        }
        this.answerId = answer.uuid;
        if (answer.draft_saved_at) {
          this.lastAutoSavedAt = answer.draft_saved_at;
        } else {
          this.lastAutoSavedAt = answer.updated_at;
        }
      },
      saveArticleCallback: (article: IArticle) => {
        if (env === 'development') {
          console.log('autoSaveEdit saveCallback');
        }
        this.articleId = article.uuid;
        if (article.draft_saved_at) {
          this.lastAutoSavedAt = article.draft_saved_at;
        } else {
          this.lastAutoSavedAt = article.updated_at;
        }
      },
    };
  }

  @Emit('submit-edit')
  private submitEdit(isPublished: boolean): INewEditEvent {
    return {
      isAutosaved: false,
      edit: this.readState(isPublished),
      answerId: this.answerId ? this.answerId : undefined,
      articleId: this.articleId ? this.articleId : undefined,
      writingSessionUUID: this.writingSessionUUID,
      saveCallback: (answer: IAnswer) => {
        this.lastAutoSavedAt = answer.updated_at;
      },
      saveArticleCallback: (article: IArticle) => {
        this.lastAutoSavedAt = article.updated_at;
      },
    };
  }

  private onEditorChange(value: string) {
    if (Math.abs(value.length - this.lastSaveLength) > 50) {
      if (!this.lastSaveIntermediate) {
        this.lastSaveIntermediate = true;
        this.lastSaveLength = value.length;
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
      if (this.answerId) {
        this.archives = (
          await apiAnswer.getAnswerArchives(this.token, this.answerId, 0, this.archivePageLimit)
        ).data;
        if (this.archives.length > 0) {
          this.historyDialog = true;
        } else {
          commitAddNotification(this.$store, {
            content: this.$t('尚无历史发表存档').toString(),
            color: 'info',
          });
        }
      }
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

  @Emit('delete-draft')
  private deleteDraft() {
    this.showDeleteDraftDialog = false;
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
}
</script>

<style lang="scss">
.slim-btn {
  padding: 0 8px !important;
}

.vditor {
  --textarea-background-color: white;
}

.vditor-sv {
  font-family: mononoki, Consolas, Liberation Mono, Menlo, Courier, monospace, Apple Color Emoji,
    Segoe UI Emoji, Noto Color Emoji, Segoe UI Symbol, Android Emoji, EmojiSymbols;
}
</style>
