<template>
  <Field v-slot="{ errors }" name="url" rules="url" v-model="model">
    <slot />
    <span class="text-error">{{ errors[0] }}</span>
  </Field>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';

const model = defineModel<string | null>();
</script>
