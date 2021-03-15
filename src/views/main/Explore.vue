<template>
  <v-container fluid>
    <v-row justify="center" fluid>
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">
            {{ $t('探索') }}
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
export default class Explore extends Vue {}
</script>
