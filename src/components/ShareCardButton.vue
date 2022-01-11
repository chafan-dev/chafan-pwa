<template>
  <span>
    <v-dialog v-model="showSharingCard" max-width="600">
      <v-card @click-outside="showSharingCard = false">
        <div class="pa-4">
          <div class="pb-2">
            <v-btn small depressed @click="onClickCopy" class="mr-2">点击复制链接</v-btn>
            <a :href="link">https://cha.fan{{ link }}</a>
          </div>
          或者截屏分享卡片：
        </div>
        <v-divider class="mx-4" />
        <slot v-bind:shareQrCodeUrl="shareQrCodeUrl"></slot>
      </v-card>
    </v-dialog>

    <v-btn depressed small @click="showSharingCardDialog" class="slim-btn">
      <ShareIcon small />
      <span v-if="isDesktop" class="ml-1">转发</span>
    </v-btn>
  </span>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import ShareIcon from '@/components/icons/ShareIcon.vue';

import QRious from 'qrious';
import { commitAddNotification } from '@/store/main/mutations';
import { CVue } from '@/common';

@Component({
  components: { ShareIcon },
})
export default class ShareCardButton extends CVue {
  @Prop() private readonly link!: string;
  @Prop() private readonly linkText!: string;
  @Prop() private readonly onClickShare!: (() => void) | undefined;

  private showSharingCard = false;
  private shareQrCodeUrl = '';

  private showSharingCardDialog() {
    if (this.onClickShare) {
      this.onClickShare();
    }
    this.showSharingCard = true;
    const qr = new QRious({
      value: window.location.origin + this.link,
    });
    this.shareQrCodeUrl = qr.toDataURL();
  }

  private async onClickCopy() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText('https://cha.fan' + this.link);
      await commitAddNotification(this.$store, {
        color: 'success',
        content: '已复制到剪贴板',
      });
    }
  }
}
</script>
