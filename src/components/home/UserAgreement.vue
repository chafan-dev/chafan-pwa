<template>
  <v-overlay v-model="overlay" opacity="0.5" z-index="10">
    <base-card v-show="showUserAgreement" color="white" elevation="2" rounded>
      <v-card-title class="primary--text">使用前必读</v-card-title>
      <div class="black--text ma-4">
        请仔细阅读<a class="text-decoration-none" href="https://about.cha.fan/docs"
          >本网站相关文档</a
        >。 如果你继续使用本网站，将视为同意「网站用户协议」并了解「社区行为守则」的内容。
      </div>
      <v-card-actions class="ma-2">
        <v-spacer />
        <v-btn color="primary" depressed small @click="continueUserAgreement">同意</v-btn>
      </v-card-actions>
    </base-card>
  </v-overlay>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import BaseCard from '@/components/base/BaseCard.vue';
import { dispatchAddFlag } from '@/store/main/actions';
import { YES_FLAG } from '@/common';
import { IUserProfile } from '@/interfaces';

const props = defineProps<{
  userProfile: IUserProfile;
}>();

const store = useStore();
const overlay = ref(false);
const showUserAgreement = ref(false);

onMounted(() => {
  if (props.userProfile.flag_list.includes(YES_FLAG)) {
    showUserAgreement.value = false;
  } else {
    showUserAgreement.value = true;
    overlay.value = true;
  }
});

async function continueUserAgreement() {
  showUserAgreement.value = false;
  await dispatchAddFlag(store, YES_FLAG);
  overlay.value = false;
}
</script>
