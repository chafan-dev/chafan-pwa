<template>
  <v-row v-if="!loading">
    <v-col v-for="(blocks, idx) in allBlocks" :key="idx" class="pb-2">
      <base-card v-for="(block, idx) in blocks" :key="idx" class="px-2 py-4">
        <h3 class="body-1">{{ block.topicName }}</h3>
        <div class="mt-2">
          <SiteBtn v-for="site in block.sites" :key="site.uuid" :showHotness="true" :site="site" />
        </div>
      </base-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api';
import { ISite, ISiteMap } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import BaseCard from '@/components/base/BaseCard.vue';
import store from '@/store';
import 'core-js/features/array/flat-map';

function uniqBy<T>(a: T[], key: (item: T) => unknown): T[] {
  const seen = new Set();
  return a.filter((item) => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

const blocks1 = ref<Array<{ topicName: string; sites: ISite[] }>>([]);
const blocks1Weight = ref(0);
const blocks2 = ref<Array<{ topicName: string; sites: ISite[] }>>([]);
const blocks2Weight = ref(0);
const loading = ref(true);

const allBlocks = computed(() => [blocks1.value, blocks2.value]);

function sitesFromSiteMap(siteMap: ISiteMap): ISite[] {
  const fromSubs = siteMap.sub_site_maps
    ? siteMap.sub_site_maps.flatMap((childSiteMap) => sitesFromSiteMap(childSiteMap))
    : [];
  return siteMap.sites.concat(fromSubs);
}

onMounted(async () => {
  // TODO I need to simplify this file 2025-06-09
  await dispatchCaptureApiError(store, async () => {
    const siteMaps = (await api.getSiteMaps()).data;

    for (const rootSiteMap of siteMaps.site_maps) {
      if (blocks2Weight.value >= blocks1Weight.value) {
        const sites = uniqBy(sitesFromSiteMap(rootSiteMap), (site: ISite) => site.uuid);
        blocks1.value.push({
          topicName: rootSiteMap.topic.name,
          sites,
        });
        blocks1Weight.value += sites.length + 5;
      } else {
        const sites = uniqBy(sitesFromSiteMap(rootSiteMap), (site: ISite) => site.uuid);
        blocks2.value.push({
          topicName: rootSiteMap.topic.name,
          sites,
        });
        blocks2Weight.value += sites.length + 5;
      }
    }
    if (blocks2Weight.value >= blocks1Weight.value) {
      blocks1.value.push({
        topicName: '未分类',
        sites: siteMaps.sites_without_topics,
      });
    } else {
      blocks2.value.push({
        topicName: '未分类',
        sites: siteMaps.sites_without_topics,
      });
    }

    loading.value = false;
  });
});
</script>
