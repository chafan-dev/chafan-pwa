<template>
  <v-sheet>
    <base-card :flat="true" :no-gutter="true" outlined>
      <v-alert type="info">
        <template v-slot:prepend>
          <v-btn icon>
            <InfoIcon />
          </v-btn>
        </template>
        刚刚加入？
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
              完善你的
              <a
                class="text-decoration-none"
                href="/profile/edit"
                target="_blank"
                @click="stepperValue = 2"
              >
                个人页面
              </a>
              来告诉朋友们你是谁
            </div>
          </v-stepper-step>

          <v-stepper-content step="1" />

          <v-stepper-step step="2">
            <div class="d-flex">
              <a class="text-decoration-none" href="/explore" target="_blank"
                >探索「茶饭」上的圈子和用户</a
              >来生成自己的信息流
            </div>
          </v-stepper-step>
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
<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from '@/components/base/BaseCard.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';

const stepperValue = ref(1);
</script>
