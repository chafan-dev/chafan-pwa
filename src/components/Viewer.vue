<template>
  <div :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }" class="viewer">
    <template v-if="content.editor === 'tiptap'">
      <ChafanTiptap :body="content.source" :editable="false" :on-editor-ready="onViewerReady" />
    </template>
    <template v-else>
      <VditorViewerCF :body="content.source" :onViewerReady="onViewerReady" />
    </template>

    <template v-if="contentElem">
      <LightboxGroup :container="contentElem" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { VditorViewerCF } from 'chafan-vue-editors';
import LightboxGroup from '@/components/image/LightboxGroup.vue';
import { CVue, postProcessViewerDOM } from '@/common';
import { IRichText } from '@/interfaces';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';

@Component({
  components: { ChafanTiptap, LightboxGroup, VditorViewerCF },
  data: function () {
    return {
      contentElem: null,
    };
  },
})
export default class Viewer extends CVue {
  public textContent: string | null = null;
  @Prop() private readonly content!: IRichText;

  private onViewerReady(contentElem: HTMLElement) {
    this.$data.contentElem = contentElem;
    postProcessViewerDOM(this.token, contentElem);
    this.textContent = contentElem.innerText;
    this.$emit('viewer-ready');
  }
}
</script>
