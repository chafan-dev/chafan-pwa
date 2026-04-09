<template>
  <span class="d-flex align-center">
    <AppIcon name="Upvoted" color="grey lighten-1"  />
    <span class="text-caption">{{ count }}</span>
  </span>
</template>
<script>
import AppIcon from '@/components/icons/AppIcon.vue';

export default {
  components: { AppIcon },
  props: ['count'],
};
</script>
