<template>
  <Tiptap
    v-on="$listeners"
    v-bind="$attrs"
    :search-users="searchUsers"
    :user-href="userHref"
    :user-label="userLabel"
    v-slot="{ user }"
    ref="base"
  >
    {{ user.full_name }} (@{{ user.handle }})
  </Tiptap>
</template>

<script lang="ts">
import { Tiptap } from 'chafan-vue-editors';
import { Component, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '../../interfaces';
import 'tippy.js/dist/tippy.css';

@Component({
  components: {
    Tiptap,
  },
})
export default class ChafanTiptap extends Vue {
  private async searchUsers(query: string) {
    return (await apiSearch.searchUsers(this.$store.state.main.token, query)).data;
  }
  private userHref(user: IUserPreview) {
    return `/users/${user.handle}`;
  }
  private userLabel(user: IUserPreview) {
    return `${user.full_name} (${user.handle})`;
  }
  get base() {
    return this.$refs.base as any;
  }
  public getJSON() {
    return this.base.getJSON();
  }
  public getText() {
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
}
</script>
