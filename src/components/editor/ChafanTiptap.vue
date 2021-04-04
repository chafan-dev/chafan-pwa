<template>
  <Tiptap
    ref="base"
    v-slot="{ user }"
    v-bind="$attrs"
    v-on="$listeners"
    :search-users="searchUsers"
    :user-href="userHref"
    :user-label="userLabel"
    :upload="upload"
  >
    {{ user.full_name }} (@{{ user.handle }})
  </Tiptap>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';

import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import { Tiptap } from 'chafan-vue-editors';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { api2 } from '@/api2';
import { readToken } from '@/store/main/getters';

@Component({
  components: {
    Tiptap,
  },
})
export default class ChafanTiptap extends Vue {
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
    return `${user.full_name} (${user.handle})`;
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

<style>
.v-application code {
  background: none !important;
}
</style>
