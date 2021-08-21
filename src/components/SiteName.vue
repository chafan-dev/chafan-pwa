<template>
  <span>
    <v-progress-circular v-if="site === null" indeterminate size="20" />
    <span v-else>
      {{ site.name }}
    </span>
  </span>
</template>

<script lang="ts">
import { ISite } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { apiSite } from '@/api/site';

@Component
export default class SiteName extends Vue {
  @Prop() public readonly subdomain!: string;
  private site: ISite | null = null;

  public async mounted() {
    this.site = (await apiSite.getSite(this.subdomain)).data;
  }
}
</script>
