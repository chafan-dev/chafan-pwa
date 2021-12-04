<template>
  <ValidationProvider v-slot="{ errors }" name="url" rules="url">
    <slot />
    <span class="error--text">{{ errors[0] }}</span>
  </ValidationProvider>
</template>
