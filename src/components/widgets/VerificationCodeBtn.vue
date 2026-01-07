<template>
  <v-btn :disabled="disabled || disabledProp" color="primary" depressed small @click="onClick">
    发送验证码
    <v-progress-circular v-if="intermediate" indeterminate size="20" />
    <span v-if="seconds !== null"> ({{ 60 - seconds }}s) </span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    sendVerificationCodeHandler: () => Promise<boolean>;
    disabledProp?: boolean;
  }>(),
  {
    disabledProp: false,
  }
);

const seconds = ref<number | null>(null);
const disabled = ref(false);
const intermediate = ref(false);

function updateSecondsSinceLastVerificationCode() {
  if (seconds.value === null) {
    return;
  }
  seconds.value += 1;
  if (seconds.value > 60) {
    disabled.value = false;
    seconds.value = null;
  } else {
    setTimeout(updateSecondsSinceLastVerificationCode, 1000);
  }
}

function onSent() {
  disabled.value = true;
  seconds.value = 0;
  setTimeout(updateSecondsSinceLastVerificationCode, 1000);
}

async function onClick() {
  intermediate.value = true;
  try {
    const ok = await props.sendVerificationCodeHandler();
    if (ok) {
      onSent();
    }
  } finally {
    intermediate.value = false;
  }
}

defineExpose({
  updateSecondsSinceLastVerificationCode,
  onSent,
});
</script>
