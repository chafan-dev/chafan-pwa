<template>
  <v-container>
    <v-row class="mb-12">
      <v-col>
        <div class="mb-1">
          <div class="headline primary--text">
            {{ $t('All Circles') }}
          </div>
          <ExploreSitesGrid />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { ExploreSitesGrid },
})
export default class Sites extends Vue {}
</script>
