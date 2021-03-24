<template>
  <v-card flat>
    <v-card-title
      >表格：
      <a class="text-decoration-none" :href="`/forms/${formResponse.form.uuid}`">
        {{ formResponse.form.title }}
      </a>
    </v-card-title>
    <div v-if="welcomeTestFormUUID === formResponse.form.uuid" class="ma-2">
      <div class="ml-2">
        {{ $t('感谢你花时间回答「新手上路问卷」！') }}
        <v-btn small depressed color="primary" @click="checkWelcomeTestScoreAndClaimRewards">{{
          $t('查看成绩和领取奖励')
        }}</v-btn>
      </div>
      <v-dialog
        max-width="300"
        v-model="showWelcomeTestResultDialog"
        v-if="claimWelcomeTestScoreMsg"
      >
        <v-card>
          <v-card-title primary-title>
            <div class="headline primary--text" v-if="claimWelcomeTestScoreMsg.success">
              {{ $t('考核及格，发放奖励') }}
            </div>
            <div class="headline primary--text" v-else>
              {{ $t('考核不及格') }}
            </div>
          </v-card-title>
          <v-card-text>
            <div class="ma-2">
              {{ $t('成绩') }}: {{ claimWelcomeTestScoreMsg.scores.score }}/{{
                claimWelcomeTestScoreMsg.scores.full_score
              }}
            </div>
            <div class="ma-2" v-if="claimWelcomeTestScoreMsg.success">
              {{ $t('奖励硬币数量') }}:
              {{ claimWelcomeTestScoreMsg.scores.score }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn small depressed to="/" v-if="claimWelcomeTestScoreMsg.success">{{
              $t('回到首页')
            }}</v-btn>
            <v-btn small depressed @click="retryWelcomeTest" v-else>{{ $t('重试') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-card
        flat
        outlined
        v-for="field in formResponse.response_fields"
        :key="field.unique_name"
        class="ma-2 pa-4"
      >
        <span>{{ field.field_type.desc }}</span>
        <div v-if="field.field_content.field_type_name === 'text_response_field'">
          <v-textarea v-model="field.field_content.text" disabled />
        </div>
        <div v-else-if="field.field_content.field_type_name === 'single_choice_response_field'">
          {{ field.field_content.selected_choice }}
        </div>
        <div v-else-if="field.field_content.field_type_name === 'multiple_choices_response_field'">
          <v-chip
            small
            class="ma-1"
            v-for="choice in field.field_content.selected_choices"
            :key="choice"
            >{{ choice }}</v-chip
          >
        </div>
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
import { api } from '@/api';
import { prodStateJsonURL } from '@/env';
import { env } from '@/env';
import { IClaimWelcomeTestScoreMsg, IFormResponse } from '@/interfaces';
import axios from 'axios';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class FormResponseCard extends Vue {
  get currentUserUUID() {
    return this.$store.state.main.userProfile.uuid;
  }
  @Prop() public readonly formResponse!: IFormResponse;

  private welcomeTestFormUUID = '';

  private showWelcomeTestResultDialog = false;
  private claimWelcomeTestScoreMsg: IClaimWelcomeTestScoreMsg | null = null;

  private async mounted() {
    if (this.currentUserUUID === this.formResponse.response_author.uuid) {
      if (env === 'development') {
        this.welcomeTestFormUUID = '48i9bNDXk2NXwp9fELCE';
      } else {
        const data = (await axios.get(prodStateJsonURL)).data;
        this.welcomeTestFormUUID = data['welcome-test-form-uuid'];
      }
    }
  }
  private async checkWelcomeTestScoreAndClaimRewards() {
    this.claimWelcomeTestScoreMsg = (
      await api.checkWelcomeTestScoreAndClaimRewards(
        this.$store.state.main.token,
        this.formResponse.id
      )
    ).data;
    this.showWelcomeTestResultDialog = true;
  }

  private async retryWelcomeTest() {
    this.$router.go(0);
  }
}
</script>
