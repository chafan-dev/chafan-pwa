<template>
  <v-row v-if="!loading">
    <v-col v-for="(blocks, idx) in allBlocks" :key="idx">
      <v-card v-for="(block, idx) in blocks" :key="idx" class="mb-4 pa-2">
        <h3>{{ block.topicName }}</h3>
        <div>
          <SiteBtn :showHotness="true" :site="site" :key="site.uuid" v-for="site in block.sites" />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { api } from '@/api';
import { ISite, ISiteMap } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Vue } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';

function uniqBy(a, key) {
  const seen = new Set();
  return a.filter((item) => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

@Component({
  components: { SiteBtn },
})
export default class ExploreSitesGrid extends Vue {
  get allBlocks() {
    return [this.blocks1, this.blocks2];
  }
  private blocks1: Array<{ topicName: string; sites: ISite[] }> = [];
  private blocks1Weight = 0;
  private blocks2: Array<{ topicName: string; sites: ISite[] }> = [];
  private blocks2Weight = 0;

  private loading = true;

  private sitesFromSiteMap(siteMap: ISiteMap): ISite[] {
    return siteMap.sites.concat(
      siteMap.sub_site_maps.flatMap((childSiteMap) => this.sitesFromSiteMap(childSiteMap))
    );
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      const siteMaps = (await api.getSiteMaps(this.$store.state.main.token)).data;

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
          topicName: this.$t('其他').toString(),
          sites: siteMaps.sites_without_topics,
        });
      } else {
        this.blocks2.push({
          topicName: this.$t('其他').toString(),
          sites: siteMaps.sites_without_topics,
        });
      }

      this.loading = false;
    });
  }
}
</script>
