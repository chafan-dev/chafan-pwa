<template>
  <span class="pl-1 pr-1">
    <v-dialog v-model="showSharingCard" max-width="400px">
      <v-card @click-outside="showSharingCard = false">
        <div class="pa-4">
          复制链接：<router-link :to="link" class="text-decoration-none">{{ linkText }}</router-link
          >，或者截屏分享卡片：
        </div>
        <v-divider class="mx-4" />
        <slot v-bind:shareQrCodeUrl="shareQrCodeUrl"></slot>
      </v-card>
    </v-dialog>

    <v-tooltip bottom v-model="tooltipModel">
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on">
          <ShareIcon @click="showSharingCardDialog" />
        </div>
      </template>
      <span>{{ $t('分享') }}</span>
    </v-tooltip>
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ShareIcon from '@/components/icons/ShareIcon.vue';

import QRious from 'qrious';

@Component({
  components: { ShareIcon },
})
export default class ShareCardButton extends Vue {
  @Prop() private readonly link!: string;
  @Prop() private readonly linkText!: string;
  @Prop() private readonly onClickShare!: (() => void) | undefined;

  private tooltipModel = false;
  private showSharingCard = false;
  private shareQrCodeUrl = '';

  private showSharingCardDialog() {
    if (this.onClickShare) {
      this.onClickShare();
    }
    this.showSharingCard = true;
    this.tooltipModel = false;
    const qr = new QRious({
      value: window.location.origin + this.link,
    });
    this.shareQrCodeUrl = qr.toDataURL();
  }
}
</script>
