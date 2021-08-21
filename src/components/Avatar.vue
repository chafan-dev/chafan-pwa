<template>
  <v-avatar v-if="userPreview" :size="size" color="primary" tile>
    <v-img
      :src="userPreview.avatar_url ? userPreview.avatar_url : '/img/default-avatar.png'"
      alt="Avatar"
    />
  </v-avatar>
</template>

<script lang="ts">
import { IUserPreview } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Avatar extends Vue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop({ default: 30 }) public readonly size!: number;
}
</script>
