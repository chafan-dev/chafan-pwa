<template>
  <div>
    <div v-if="site.min_karma_for_application">
      <b>{{ $t('加入最低 Karma：') }}</b
      ><span>{{ site.min_karma_for_application }}</span>
    </div>
    <div v-if="site.email_domain_suffix_for_application">
      <b>{{ $t('加入所需邮箱地址后缀：') }}</b>
      <span>
        {{ site.email_domain_suffix_for_application }}
      </span>
      <p v-if="showHint">
        {{ $t('在「安全中心」中可以添加并验证满足条件的次要邮箱地址') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ISite } from '@/interfaces';

@Component
export default class SiteJoinConditions extends Vue {
  @Prop() private readonly site!: ISite;
  @Prop({ default: false }) private readonly showHint!: boolean;
}
</script>
