<template>
  <div>
    <div v-if="site.min_karma_for_application">
      <b>加入最低 Karma：</b>
      <span>{{ site.min_karma_for_application }}</span>
    </div>
    <div v-if="site.email_domain_suffix_for_application">
      <b>加入所需邮箱地址后缀：</b>
      <span>
        {{ site.email_domain_suffix_for_application }}
      </span>
      <p v-if="showHint">在「安全中心」中可以添加并验证满足条件的次要邮箱地址</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ISite } from '@/interfaces';

withDefaults(
  defineProps<{
    site: ISite;
    showHint?: boolean;
  }>(),
  {
    showHint: false,
  }
);
</script>
