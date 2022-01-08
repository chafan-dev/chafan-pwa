<template>
  <v-chip :to="'/topics/' + topic.uuid" class="mr-1 mb-1" small label color="grey lighten-4"
    >{{ topic.name }}
  </v-chip>
</template>

<script lang="ts">
import { CVue } from '@/common';
import { Component, Prop } from 'vue-property-decorator';
import { ITopic } from '@/interfaces';

@Component
export default class TopicChip extends CVue {
  @Prop() public readonly topic!: ITopic;
}
</script>
