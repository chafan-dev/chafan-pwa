<template>
  <div>
    <span v-if="initialContent === '[DELETED]'" class="grey--text"> 已删除 </span>
    <TiptapCF
      v-else
      ref="base"
      v-bind="$attrs"
      v-on="$listeners"
      :comment-mode="commentMode"
      :editable="editable"
      :on-editor-change="onChange"
      :on-editor-ready="onEditorReadyInternal"
      :search-users="searchUsers"
      :upload="upload"
      :user-href="userHref"
      :user-label="userLabel"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';

import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import { TiptapCF } from 'chafan-vue-editors';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { api2 } from '@/api2';
import { readToken } from '@/store/main/getters';

declare const renderMathInElement: any;

@Component({
  components: {
    TiptapCF,
  },
})
export default class ChafanTiptap extends Vue {
  @Prop() public readonly onEditorReady: ((contentElem: HTMLElement) => void) | undefined;
  @Prop() public readonly onEditorChange: ((text: string) => void) | undefined;
  @Prop() public readonly initialContent: string | undefined;
  @Prop({ default: true }) private readonly editable!: boolean;
  @Prop({ default: false }) private readonly commentMode!: boolean;
  @Prop() private readonly onMentionedHandles: ((handles: string[]) => void) | undefined;

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
    return response.data.url;
  }

  mounted() {
    if (this.initialContent) {
      this.loadJSON(JSON.parse(this.initialContent));
    }
  }

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

  private onChange() {
    if (this.onMentionedHandles) {
      const handles: string[] = [];
      this.$el.querySelectorAll('a.mention').forEach((elem: Element) => {
        const anchor = elem as HTMLAnchorElement;
        const url = new URL(anchor.href);
        const segments = url.pathname.split('/');
        if (segments.length === 3 && segments[1] === 'users') {
          handles.push(decodeURI(segments[2]));
        }
      });
      this.onMentionedHandles(handles);
    }
    if (this.onEditorChange) {
      this.onEditorChange(this.getText() || '');
    }
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
}
</script>
