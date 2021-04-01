<template>
  <Tiptap
    ref="base"
    v-slot="{ user }"
    v-bind="$attrs"
    v-on="$listeners"
    :search-users="searchUsers"
    :user-href="userHref"
    :user-label="userLabel"
  >
    {{ user.full_name }} (@{{ user.handle }})
  </Tiptap>
</template>

<script lang="ts">
import { Tiptap } from 'chafan-vue-editors';
import { Component, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';
import 'tippy.js/dist/tippy.css';

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
}
</script>
