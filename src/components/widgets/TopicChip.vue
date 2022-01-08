<template>
  <v-chip
    :to="'/topics/' + topic.uuid"
    :classes="{ 'mr-1': moreMargin, 'mb-1': moreMargin }"
    small
    label
    color="grey lighten-4"
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
  @Prop({ default: true }) public readonly moreMargin!: boolean;
}
</script>
