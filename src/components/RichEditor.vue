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

    <Tiptap
      ref="tiptap"
      class="mb-2 mx-2"
      :class="{ 'mt-2': focusMode }"
      v-show="topLevelEditor === 'tiptap'"
      :onEditorChange="onEditorChange"
    />

    <VditorComponent
      ref="vditor"
      class="mb-2"
      :class="{ 'mt-2': focusMode }"
      v-show="topLevelEditor === 'vditor'"
      :onEditorChange="onEditorChange"
    />

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

      <v-menu offset-y top :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <SettingsIcon class="ml-1" v-bind="attrs" v-on="on" />
        </template>
        <v-list dense>
          <v-list-item @click="showDeleteDraftDialog = true" v-if="answerId || articleId">
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
          <v-list-item v-if="topLevelEditorItems !== null">
            <v-list-item-icon>
              <EditIcon />
            </v-list-item-icon>
            <v-list-item-content>
              <v-select
                dense
                :items="topLevelEditorItems"
                v-model="topLevelEditor"
                item-text="text"
                item-value="value"
                @change="onChangeTopLevelEditor"
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
                <Viewer :body="archive.body" :editor="archive.editor" />
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
  editor_T,
  IAnswer,
  IArchive,
  IArticle,
  IArticleArchive,
  INewEditEvent,
  IRichEditorState,
} from '@/interfaces';
import { apiAnswer } from '@/api/answer';
import { apiArticle } from '@/api/article';
import { env } from '@/env';

import { dispatchCaptureApiError } from '@/store/main/actions';
import Tiptap from '@/components/editor/Tiptap.vue';
import VditorComponent from '@/components/editor/VditorComponent.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import { LABS_TIPTAP_EDITOR_OPTION } from '@/common';

@Component({
  components: {
    EditIcon,
    Tiptap,
    VditorComponent,
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
  private topLevelEditorItems: { text: string; value: string }[] | null = null;

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

  private lastAutoSavedAt: string | null = null;

  private lastSaveLength = 0;
  private lastSaveIntermediate = false;
  private lastSaveTimerId: any = null;

  private archives: IArchive[] = [];
  private selectedArchive: IArchive | null = null;

  private articleArchives: IArticleArchive[] = [];
  private selectedArticleArchive: IArticleArchive | null = null;
  private showDeleteDraftDialog = false;

  private mounted() {
    this.answerId = this.answerIdProp ? this.answerIdProp : null;
    this.articleId = this.articleIdProp ? this.articleIdProp : null;
    const workingDraft = readWorkingDraft(this.$store);
    if (workingDraft) {
      this.visibility = workingDraft.visibility;
      this.articleTitle = workingDraft.title;
      this.initEditor(workingDraft.body, workingDraft.editor);
      this.lastSaveLength = workingDraft.body.length;
    } else {
      this.initEditor(null, readUserProfile(this.$store)!.default_editor_mode);
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
        text: this.$t('tiptap (beta ⚠️)').toString(),
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
      return (this.$refs.vditor as VditorComponent).getMode();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return 'wysiwyg';
  }

  private getContent() {
    if (this.topLevelEditor === 'tiptap') {
      return JSON.stringify((this.$refs.tiptap as Tiptap).getJSON());
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as VditorComponent).getContent();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return '';
  }

  private getTextContent() {
    if (this.topLevelEditor === 'tiptap') {
      return (this.$refs.tiptap as Tiptap).getText();
    } else if (this.topLevelEditor === 'vditor') {
      return (this.$refs.vditor as VditorComponent).getText();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return '';
  }

  private readState(isPublished: boolean): IRichEditorState {
    return {
      title: this.articleTitle,
      body: this.getContent(),
      rendered_body_text: this.getTextContent(),
      is_draft: !isPublished,
      visibility: this.visibility,
      editor: this.getEditorMode(),
    };
  }

  private topLevelEditor: 'tiptap' | 'vditor' = 'vditor';

  private initEditor(body: string | null, editor: editor_T) {
    if (editor === 'tiptap') {
      this.topLevelEditor = 'tiptap';
      if (body) {
        (this.$refs.tiptap as Tiptap).loadJSON(JSON.parse(body));
      }
    } else {
      this.topLevelEditor = 'vditor';
      (this.$refs.vditor as VditorComponent).init(editor, body || '');
    }
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

  private onEditorChange(textContent: string) {
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

  private onChangeTopLevelEditor() {
    if (this.topLevelEditor === 'tiptap') {
      const oldContent = (this.$refs.vditor as VditorComponent).getHTML();
      (this.$refs.tiptap as Tiptap).loadHTML(oldContent);
    } else if (this.topLevelEditor === 'vditor') {
      const oldContent = (this.$refs.tiptap as Tiptap).getHTML();
      (this.$refs.vditor as VditorComponent).init('wysiwyg', undefined, oldContent);
    }
  }
}
</script>

<style lang="scss">
.slim-btn {
  padding: 0 8px !important;
}
</style>
