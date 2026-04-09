<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { ISite } from '@/interfaces';
import SiteCard from '@/components/SiteCard.vue';
import AppIcon from '@/components/icons/AppIcon.vue';
const display = useDisplay();

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
  // Material Design lighten-5 hex values (matching Vuetify 2 behavior)
  const colors = [
    '#EFEBE9', // brown lighten-5
    '#FAFAFA', // grey lighten-5
    '#FFFDE7', // yellow lighten-5
    '#E3F2FD', // blue lighten-5
    '#E8F5E9', // green lighten-5
    '#F3E5F5', // purple lighten-5
    '#E8EAF6', // indigo lighten-5
    '#E0F7FA', // cyan lighten-5
    '#E0F2F1', // teal lighten-5
    '#FFF8E1', // amber lighten-5
    '#ECEFF1', // blue-grey lighten-5
  ];
  return colors[Math.abs(hashCode(props.site.name)) % colors.length];
});
</script>

<template>
  <v-menu location="top end" :open-on-hover="!display.mobile" open-delay="600">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :color="color"
        :to="'/sites/' + site.subdomain"
        class="mr-1 mt-1"
        variant="flat"
        size="small"
      >
        {{ site.name }}
        <AppIcon name="PrivateSite" v-if="site.permission_type === 'private'" class="ml-1"  />
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
