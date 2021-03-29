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
        <v-btn color="primary" @click="continueUserAgreement">同意</v-btn>
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
import { dispatchAddFlag } from '@/store/main/actions';
import { FAB_FLAG, YES_FLAG } from '@/common';
import { IUserProfile } from '@/interfaces';

@Component({
  components: { BaseCard },
})
export default class UserAgreement extends Vue {
  @Prop() public readonly userProfile!: IUserProfile;

  private showFabHint = false;
  private showUserAgreement = false;
  public overlay = false;

  mounted() {
    if (this.userProfile.flag_list.includes(YES_FLAG)) {
      this.showUserAgreement = false;
    } else {
      this.showUserAgreement = true;
      this.overlay = true;
    }
  }

  private async continueUserAgreement() {
    this.showUserAgreement = false;
    await dispatchAddFlag(this.$store, YES_FLAG);
    if (!this.$vuetify.breakpoint.mdAndUp) {
      if (this.userProfile.flag_list.includes(FAB_FLAG)) {
        this.overlay = false;
      } else {
        this.showFabHint = true;
      }
    } else {
      this.overlay = false;
    }
  }
}
</script>
