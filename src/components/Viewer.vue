<template>
  <div :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }" class="viewer">
    <template v-if="content.editor === 'tiptap'">
      <ChafanTiptap :body="content.source" :editable="false" :on-editor-ready="onViewerReady" />
    </template>
    <template v-else>
      <VditorViewerCF :body="content.source" :on-viewer-ready="onViewerReady" />
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
import { IRichText } from '@/interfaces';
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
  @Prop() private readonly content!: IRichText;
  public textContent: string | null = null;

  private onViewerReady(contentElem: HTMLElement) {
    this.$data.contentElem = contentElem;
    postProcessViewerDOM(readToken(this.$store), contentElem);
    this.textContent = contentElem.innerText;
  }
}
</script>
