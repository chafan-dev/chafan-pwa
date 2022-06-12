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

<script lang="ts">
import { api } from '@/api';
import { ISite, ISiteMap } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Vue } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import BaseCard from '@/components/base/BaseCard.vue';
import { readToken } from '@/store/main/getters';
import 'core-js/features/array/flat-map';

function uniqBy(a, key) {
  const seen = new Set();
  return a.filter((item) => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

@Component({
  components: { BaseCard, SiteBtn },
})
export default class ExploreSitesGrid extends Vue {
  private blocks1: Array<{ topicName: string; sites: ISite[] }> = [];
  private blocks1Weight = 0;
  private blocks2: Array<{ topicName: string; sites: ISite[] }> = [];
  private blocks2Weight = 0;
  private loading = true;

  get allBlocks() {
    return [this.blocks1, this.blocks2];
  }

  private sitesFromSiteMap(siteMap: ISiteMap): ISite[] {
    const fromSubs = siteMap.sub_site_maps
      ? siteMap.sub_site_maps.flatMap((childSiteMap) => this.sitesFromSiteMap(childSiteMap))
      : [];
    return siteMap.sites.concat(fromSubs);
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      const siteMaps = (await api.getSiteMaps(readToken(this.$store))).data;

      for (const rootSiteMap of siteMaps.site_maps) {
        if (this.blocks2Weight >= this.blocks1Weight) {
          const sites = uniqBy(this.sitesFromSiteMap(rootSiteMap), (site: ISite) => site.uuid);
          this.blocks1.push({
            topicName: rootSiteMap.topic.name,
            sites,
          });
          this.blocks1Weight += sites.length + 5;
        } else {
          const sites = uniqBy(this.sitesFromSiteMap(rootSiteMap), (site: ISite) => site.uuid);
          this.blocks2.push({
            topicName: rootSiteMap.topic.name,
            sites,
          });
          this.blocks2Weight += sites.length + 5;
        }
      }
      if (this.blocks2Weight >= this.blocks1Weight) {
        this.blocks1.push({
          topicName: '未分类',
          sites: siteMaps.sites_without_topics,
        });
      } else {
        this.blocks2.push({
          topicName: '未分类',
          sites: siteMaps.sites_without_topics,
        });
      }

      this.loading = false;
    });
  }
}
</script>
