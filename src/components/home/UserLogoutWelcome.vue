<template>
  <v-sheet>
    <v-alert outlined type="info"> 登录后浏览更多个性化内容！ </v-alert>

    <ExploreSitesGrid />
  </v-sheet>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';

@Component({
  components: { ExploreSitesGrid },
})
export default class UserLogoutWelcome extends Vue {}
</script>
