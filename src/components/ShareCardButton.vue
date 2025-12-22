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

<script setup lang="ts">
import { ref } from 'vue';
import ShareIcon from '@/components/icons/ShareIcon.vue';
import QRious from 'qrious';
import { useResponsive, useNotification } from '@/composables';

const props = defineProps<{
  link: string;
  linkText?: string;
  onClickShare?: () => void;
}>();

const { isDesktop } = useResponsive();
const { notifySuccess } = useNotification();

const showSharingCard = ref(false);
const shareQrCodeUrl = ref('');

function showSharingCardDialog() {
  if (props.onClickShare) {
    props.onClickShare();
  }
  showSharingCard.value = true;
  const qr = new QRious({
    value: window.location.origin + props.link,
  });
  shareQrCodeUrl.value = qr.toDataURL();
}

async function onClickCopy() {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText('https://cha.fan' + props.link);
    notifySuccess('已复制到剪贴板');
  }
}
</script>
