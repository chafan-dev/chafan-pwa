<template>
  <div>
    <v-dialog v-model="showImageDialog" max-width="700">
      <v-card>
        <v-card-title> Add image </v-card-title>
        <v-card-text>
          <v-text-field v-model="insertImageUrl" label="image URL" type="text" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            depressed
            @click="
              insertImageUrl = '';
              showImageDialog = false;
            "
          >
            Close
          </v-btn>
          <v-btn small color="primary" depressed @click="insertImage"> Insert </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showVideoDialog" max-width="700">
      <v-card>
        <v-card-title> Add video </v-card-title>
        <v-card-text>
          <v-text-field v-model="youtubeUrl" label="YouTube URL" type="text" />
          <v-text-field v-model="bilibiliEmbedCode" label="Bilibili Embed Code" type="text" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            depressed
            @click="
              youtubeUrl = '';
              showVideoDialog = false;
            "
          >
            Close
          </v-btn>
          <v-btn small color="primary" depressed @click="insertVideo"> Insert </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex pb-1" v-if="editable && !commentMode">
      <v-spacer />
      <v-btn small outlined color="grey" @click="showImageDialog = true">Image</v-btn>
      <v-btn small class="ml-1" outlined color="grey" @click="showVideoDialog = true">Video</v-btn>
    </div>
    <Tiptap
      ref="base"
      v-bind="$attrs"
      v-on="$listeners"
      class="tiptap"
      :editable="editable"
      :comment-mode="commentMode"
      :search-users="searchUsers"
      :user-href="userHref"
      :user-label="userLabel"
      :upload="upload"
      :video-dialog-controller="videoDialogController"
      :image-dialog-controller="imageDialogController"
      :on-editor-change="onEditorChange"
      :on-editor-ready="onEditorReadyInternal"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';

import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import { Tiptap } from 'chafan-vue-editors';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { api2 } from '@/api2';
import { readToken } from '@/store/main/getters';
import getYouTubeID from 'get-youtube-id';

interface ITiptapDialogController {
  onUrl: ((url: string) => void) | undefined;
}

declare const renderMathInElement: any;

@Component({
  components: {
    Tiptap,
  },
})
export default class ChafanTiptap extends Vue {
  @Prop({ default: true }) private readonly editable!: boolean;
  @Prop({ default: false }) private readonly commentMode!: boolean;
  @Prop() public readonly onEditorReady: ((contentElem: HTMLElement) => void) | undefined;
  @Prop() private readonly onMentionedHandles: ((handles: string[]) => void) | undefined;

  private onEditorReadyInternal(contentElem: HTMLElement) {
    if (this.onEditorReady) {
      this.onEditorReady(contentElem);
    }
    if (!this.editable) {
      renderMathInElement(contentElem, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
      });
    }
  }

  private onEditorChange() {
    if (this.onMentionedHandles) {
      const tiptapElement = this.$el.getElementsByClassName('tiptap')[0];
      const handles: string[] = [];
      tiptapElement.querySelectorAll('a.mention').forEach((elem: Element) => {
        const anchor = elem as HTMLAnchorElement;
        const url = new URL(anchor.href);
        const segments = url.pathname.split('/');
        if (segments.length === 3 && segments[1] === 'users') {
          handles.push(segments[2]);
        }
      });
      this.onMentionedHandles(handles);
    }
  }

  private showVideoDialog = false;
  readonly videoDialogController: ITiptapDialogController = {
    onUrl: undefined,
  };
  private showImageDialog = false;
  readonly imageDialogController: ITiptapDialogController = {
    onUrl: undefined,
  };
  private insertImageUrl = '';
  private insertImage() {
    if (this.imageDialogController.onUrl) {
      this.imageDialogController.onUrl(this.insertImageUrl);
    }
    this.showImageDialog = false;
  }

  private youtubeUrl = '';
  private bilibiliEmbedCode = '';
  private insertVideo() {
    let url = '';
    if (this.youtubeUrl) {
      const youtubeId = getYouTubeID(this.youtubeUrl);
      if (youtubeId) {
        url = `https://www.youtube.com/embed/${youtubeId}`;
      }
    } else if (this.bilibiliEmbedCode) {
      const bilibiliEmbedDOM = new DOMParser().parseFromString(this.bilibiliEmbedCode, 'text/html');
      const iframe = bilibiliEmbedDOM.getElementsByTagName('iframe')[0];
      if (iframe) {
        const iframeUrl = new URL(iframe.src);
        if (iframeUrl.hostname === 'player.bilibili.com') {
          url = iframeUrl.href;
        }
      }
    }

    if (!url) {
      return;
    }
    if (this.videoDialogController.onUrl) {
      this.videoDialogController.onUrl(url);
    }
    this.showVideoDialog = false;
  }

  get base() {
    return this.$refs.base as any;
  }

  get content(): string | null {
    const json = this.base.getJSON();
    if (json) {
      return JSON.stringify(json);
    }
    return null;
  }

  set content(value: string | null) {
    if (!value) {
      this.base.reset();
      return;
    }
    this.base.loadJSON(JSON.parse(value));
  }

  public getText(): string | null {
    return this.base.getText();
  }

  public getHTML() {
    return this.base.getHTML();
  }

  public loadHTML(html: string) {
    return this.base.loadHTML(html);
  }

  public loadJSON(json: any) {
    return this.base.loadJSON(json);
  }

  public reset() {
    this.base.reset();
  }

  private async searchUsers(query: string) {
    return (await apiSearch.searchUsers(this.$store.state.main.token, query)).data;
  }

  private userHref(user: IUserPreview) {
    return `/users/${user.handle}`;
  }

  private userLabel(user: IUserPreview) {
    return user.full_name ? `${user.full_name} (${user.handle})` : user.handle;
  }

  async upload(file: Blob) {
    const resized = await resizeImage({
      maxSize: 500, // px
      file,
    });

    const formData = new FormData();
    // Upload candidate image and update URL
    try {
      formData.append('file', piexif.remove(resized.blob));
      // Remove EXIF if it is jpeg
    } catch {
      formData.append('file', resized.blob);
    }
    const response = await api2.uploadFile(readToken(this.$store), formData);
    return response.data.msg;
  }
}
</script>
