<script setup lang="ts">
import { computed } from 'vue';
import { ISite } from '@/interfaces';
import PrivateSiteIcon from '@/components/icons/PrivateSiteIcon.vue';
import SiteCard from '@/components/SiteCard.vue';

function hashCode(str: string) {
  let hash = 0,
    i,
    chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const props = withDefaults(defineProps<{
  site: ISite;
  showHotness?: boolean;
}>(), {
  showHotness: false,
});

const hotness = computed(() =>
  Math.floor(
    Math.log2(
      props.site.questions_count +
        props.site.members_count / 10 +
        props.site.submissions_count / 2 +
        1
    )
  )
);

const color = computed(() => {
  const colors = [
    'brown',
    'grey',
    'yellow',
    'blue',
    'green',
    'purple',
    'indigo',
    'cyan',
    'teal',
    'amber',
    'blue-grey',
  ];
  return colors[hashCode(props.site.name) % colors.length] + ' lighten-5';
});
</script>

<template>
  <v-menu :open-on-hover="!$vuetify.breakpoint.mobile" offset-y open-delay="600" right top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        :color="color"
        :to="'/sites/' + site.subdomain"
        class="mr-1 mt-1"
        depressed
        small
      >
        {{ site.name }}
        <PrivateSiteIcon v-if="site.permission_type === 'private'" class="ml-1" />
        <span v-if="showHotness" class="ml-1">({{ hotness }})</span>
      </v-btn>
    </template>
    <v-lazy>
      <v-card max-width="400">
        <SiteCard
          :compactMode="true"
          :showQuestionEditor="false"
          :showSubmissionEditor="false"
          :site="site"
          class="px-3 py-2"
        />
      </v-card>
    </v-lazy>
  </v-menu>
</template>
