<template>
  <span class="d-flex align-center">
    <UpvotedIcon color="grey lighten-1" />
    <span class="text-caption">{{ count }}</span>
  </span>
</template>
<script>
import UpvotedIcon from '@/components/icons/UpvotedIcon';

export default {
  components: { UpvotedIcon },
  props: ['count'],
};
</script>
