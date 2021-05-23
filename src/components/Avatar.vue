<template>
  <v-avatar v-if="userPreview" color="primary" :size="size" tile>
    <v-img
      :src="userPreview.avatar_url ? userPreview.avatar_url : '/img/default-avatar.png'"
      alt="Avatar"
    />
  </v-avatar>
</template>

<script lang="ts">
import { IUserPreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Avatar extends Vue {
  @Prop() public readonly userPreview!: IUserPreview;
  @Prop({ default: 30 }) public readonly size!: number;
}
</script>
