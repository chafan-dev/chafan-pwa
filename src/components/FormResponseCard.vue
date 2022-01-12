<template>
  <v-card flat>
    <v-card-title
      >表格：
      <a :href="`/forms/${formResponse.form.uuid}`" class="text-decoration-none">
        {{ formResponse.form.title }}
      </a>
    </v-card-title>
    <div v-if="welcomeTestFormUUID === formResponse.form.uuid" class="ma-2">
      <div class="ml-2">
        感谢你花时间回答「新手上路问卷」！
        <v-btn color="primary" depressed small @click="checkWelcomeTestScoreAndClaimRewards">
          查看成绩和领取奖励
        </v-btn>
      </div>
      <v-dialog
        v-if="claimWelcomeTestScoreMsg"
        v-model="showWelcomeTestResultDialog"
        max-width="300"
      >
        <v-card>
          <v-card-title primary-title>
            <div v-if="claimWelcomeTestScoreMsg.success" class="headline primary--text">
              考试及格，发放奖励
            </div>
            <div v-else class="headline primary--text">考试不及格，请继续尝试</div>
          </v-card-title>
          <v-card-text>
            <div class="ma-2">
              成绩: {{ claimWelcomeTestScoreMsg.scores.score }}/{{
                claimWelcomeTestScoreMsg.scores.full_score
              }}
            </div>
            <div v-if="claimWelcomeTestScoreMsg.success" class="ma-2">
              奖励硬币数量：
              {{ claimWelcomeTestScoreMsg.scores.score }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn v-if="claimWelcomeTestScoreMsg.success" depressed small to="/"> 回到首页</v-btn>
            <v-btn v-else depressed small @click="retryWelcomeTest">重试</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-card
        v-for="field in formResponse.response_fields"
        :key="field.unique_name"
        class="ma-2 pa-4"
        flat
        outlined
      >
        <span>{{ field.field_content.desc }}</span>
        <div v-if="field.field_content.field_type_name === 'text_response_field'">
          <v-textarea v-model="field.field_content.text" disabled />
        </div>
        <div v-else-if="field.field_content.field_type_name === 'single_choice_response_field'">
          {{ field.field_content.selected_choice }}
        </div>
        <div v-else-if="field.field_content.field_type_name === 'multiple_choices_response_field'">
          <v-chip
            v-for="choice in field.field_content.selected_choices"
            :key="choice"
            class="ma-1"
            small
            >{{ choice }}
          </v-chip>
        </div>
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
import { api } from '@/api';
import { IClaimWelcomeTestScoreMsg, IFormResponse } from '@/interfaces';
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component
export default class FormResponseCard extends CVue {
  @Prop() public readonly formResponse!: IFormResponse;
  private welcomeTestFormUUID = '';
  private showWelcomeTestResultDialog = false;
  private claimWelcomeTestScoreMsg: IClaimWelcomeTestScoreMsg | null = null;

  private async mounted() {
    if (this.currentUserId === this.formResponse.response_author.uuid) {
      if (this.isDev) {
        this.welcomeTestFormUUID = '48i9bNDXk2NXwp9fELCE';
      } else {
        this.welcomeTestFormUUID = '4CGv4iReMxuWjs3T2PEY';
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
