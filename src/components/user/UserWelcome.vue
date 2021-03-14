<template>
  <v-sheet>
    <base-card :embedded="true" :no-gutter="true" outlined>
      <v-alert type="info">
        <template v-slot:prepend>
          <v-btn icon>
            <InfoIcon />
          </v-btn>
        </template>

        {{ $t('刚刚加入？') }}

        <template v-slot:close>
          <v-btn icon @click="$emit('on-close-explore-sites')">
            <close-icon />
          </v-btn>
        </template>
      </v-alert>

      <div>
        <v-stepper class="elevation-0" value="1" vertical>
          <v-stepper-step step="1">
            <div class="d-flex">
              {{ $t('完善') }}

              <router-link class="text-decoration-none" to="/profile/edit">
                {{ $t('个人页面') }}
              </router-link>

              {{ $t('来告诉朋友们你是谁') }}
            </div>
          </v-stepper-step>

          <v-stepper-content step="1" />

          <v-stepper-step step="2">
            {{ $t('探索 Chafan 上的感兴趣的圈子和用户来生成自己的信息流：') }}
          </v-stepper-step>

          <v-stepper-content step="2" />
        </v-stepper>
      </div>
    </base-card>

    <explore-sites-grid class="mt-2" />
  </v-sheet>
</template>
<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';

@Component({
  components: { InfoIcon, CloseIcon, BaseCard, ExploreSitesGrid },
})
export default class UserWelcome extends Vue {
  @Emit('on-close-explore-sites')
  public onCloseExploreSites() {}
}
</script>
