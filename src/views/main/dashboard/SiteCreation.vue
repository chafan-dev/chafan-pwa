<template>
  <div>
    <div>
      <span><b>显示名</b>：{{ site_creation.name }}</span
      >，
      <span><b>唯一域名</b>：{{ site_creation.subdomain }}</span>
    </div>
    <div v-if="topic"><b>类别</b>：<Topic /></div>
    <div>
      <b>圈子类型</b>：
      <span v-if="site_creation.permission_type === 'public'">公开</span>
      <span v-if="site_creation.permission_type === 'private'">私密</span>
    </div>
    <div v-if="site_creation.description"><b>描述</b>：{{ site_creation.description }}</div>
  </div>
  <!-- TODO: 截屏 -->
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';
import { ISiteCreate, ITopic } from '@/interfaces';
import Topic from '@/views/main/Topic.vue';
import { apiTopic } from '@/api/topic';
@Component({
  components: { Topic },
})
export default class SiteCreation extends CVue {
  @Prop() readonly site_creation!: ISiteCreate;
  private topic: ITopic | null = null;

  async mount() {
    if (this.site_creation.category_topic_uuid) {
      this.topic = (await apiTopic.getTopic(this.site_creation.category_topic_uuid)).data;
    }
  }
}
</script>
