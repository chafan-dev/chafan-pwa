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
            <CloseIcon />
          </v-btn>
        </template>
      </v-alert>

      <div>
        <v-stepper v-model="stepperValue" class="elevation-0" vertical>
          <v-stepper-step :complete="stepperValue > 1" step="1">
            <div class="d-flex">
              {{ $t('完善') }}

              <a
                class="text-decoration-none"
                href="/profile/edit"
                target="_blank"
                @click="stepperValue = 2"
              >
                {{ $t('个人页面') }}
              </a>

              {{ $t('来告诉朋友们你是谁') }}
            </div>
          </v-stepper-step>

          <v-stepper-content step="1" />

          <v-stepper-step step="2">
            {{ $t('探索「茶饭」上的感兴趣的圈子和用户来生成自己的信息流：') }}
          </v-stepper-step>

          <v-stepper-content step="2" />
          <explore-sites-grid />
        </v-stepper>

        <div class="text-center mb-4">
          更多帮助：<a
            class="text-decoration-none"
            href="https://cha.fan/questions/6Xrr59FKbTdFU4M6mXUg"
            target="_blank"
            >「新用户如何上手「茶饭」？ 」</a
          >
        </div>
      </div>
    </base-card>
  </v-sheet>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';

@Component({
  components: { InfoIcon, CloseIcon, BaseCard, ExploreSitesGrid },
})
export default class UserWelcome extends Vue {
  private stepperValue = 1;
}
</script>
