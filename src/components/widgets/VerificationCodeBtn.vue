<template>
  <v-btn :disabled="disabled || disabledProp" color="primary" depressed small @click="onClick">
    发送验证码
    <v-progress-circular v-if="intermediate" indeterminate size="20" />
    <span v-if="seconds !== null"> ({{ 60 - seconds }}s) </span>
  </v-btn>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component
export default class VerificationCodeBtn extends CVue {
  @Prop() public readonly sendVerificationCodeHandler!: () => Promise<boolean>;
  @Prop({ default: false }) readonly disabledProp!: boolean;

  private seconds: number | null = null;
  private disabled = false;
  private intermediate = false;

  private async onClick() {
    this.intermediate = true;
    try {
      const ok = await this.sendVerificationCodeHandler();
      if (ok) {
        this.onSent();
      }
    } finally {
      this.intermediate = false;
    }
  }

  public updateSecondsSinceLastVerificationCode() {
    if (this.seconds === null) {
      return;
    }
    this.seconds += 1;
    if (this.seconds > 60) {
      this.disabled = false;
      this.seconds = null;
    } else {
      setTimeout(this.updateSecondsSinceLastVerificationCode, 1000);
    }
  }

  public onSent() {
    this.disabled = true;
    this.seconds = 0;
    setTimeout(this.updateSecondsSinceLastVerificationCode, 1000);
  }
}
</script>
