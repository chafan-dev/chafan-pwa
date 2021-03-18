<template>
  <v-overlay v-model="overlay" opacity="0.5" z-index="10">
    <base-card v-show="showUserAgreement" color="white" elevation="2" rounded>
      <v-card-title class="primary--text">{{ $t('使用前必读') }}</v-card-title>
      <div class="black--text ma-4">
        请仔细阅读<a class="text-decoration-none" href="https://about.cha.fan/docs"
          >本网站相关文档</a
        >。 如果你继续使用本网站，将视为同意「网站用户协议」并了解「社区行为守则」的内容。
      </div>
      <v-card-actions class="ma-2">
        <v-spacer />
        <v-btn color="primary" @click="$emit('continue-user-agreement')">同意</v-btn>
      </v-card-actions>
    </base-card>
    <v-card v-show="showFabHint" color="white" elevation="2" rounded>
      <v-card-title class="primary--text">{{ $t('Try the explore button') }} ↘</v-card-title>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from '@/components/base/BaseCard.vue';

@Component({
  components: { BaseCard },
})
export default class UserAgreement extends Vue {
  @Prop() private readonly overlay!: boolean;
  @Prop() private readonly showUserAgreement!: boolean;
  @Prop() private readonly showFabHint!: boolean;
}
</script>
