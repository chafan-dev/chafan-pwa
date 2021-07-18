<template>
  <div :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }" class="viewer">
    <template v-if="editor === 'tiptap'">
      <ChafanTiptap
        :body="body"
        :bodyFormat="bodyFormat"
        :editable="false"
        :on-editor-ready="onViewerReady"
      />
    </template>
    <template v-else-if="!bodyFormat || bodyFormat === 'markdown'">
      <VditorViewerCF :body="body" :on-viewer-ready="onViewerReady" />
    </template>
    <template v-if="contentElem">
      <LightboxGroup :container="contentElem" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { VditorViewerCF } from 'chafan-vue-editors';
import LightboxGroup from '@/components/image/LightboxGroup.vue';
import { postProcessViewerDOM } from '@/common';
import { body_format_T, editor_T } from '@/interfaces';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { readToken } from '@/store/main/getters';

@Component({
  components: { ChafanTiptap, LightboxGroup, VditorViewerCF },
  data: function () {
    return {
      contentElem: null,
    };
  },
})
export default class Viewer extends Vue {
  @Prop() private readonly body!: string;
  @Prop() private readonly bodyFormat: body_format_T | undefined;
  @Prop() private readonly editor!: editor_T;
  public textContent: string | null = null;

  private onViewerReady(contentElem: HTMLElement) {
    this.$data.contentElem = contentElem;
    postProcessViewerDOM(readToken(this.$store), contentElem);
    this.textContent = contentElem.innerText;
  }
}
</script>
