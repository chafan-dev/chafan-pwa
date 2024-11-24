<template>
  <div>
    <div>
      <span><b>显示名</b>：{{ site_creation.name }}</span
      >，
      <span><b>唯一域名</b>：{{ site_creation.subdomain }}</span>
    </div>
    <div>
      <b>圈子类型</b>：
      <span v-if="site_creation.permission_type === 'public'">公开</span>
      <span v-if="site_creation.permission_type === 'private'">私密</span>
    </div>
    <!-- I should set this to necessary manually -->
    <div v-if="site_creation.description"><b>描述*</b>：{{ site_creation.description }}</div>
    <div v-if="userProfile.is_superuser && !existingSite && !intermediate" class="mt-1">
      <v-btn depressed small @click="createSite">
        创建圈子
        <v-progress-circular class="ml-1" size="3" indeterminate />
      </v-btn>
    </div>
    <div v-if="existingSite">圈子已创建：<SiteBtn :site="existingSite" /></div>
  </div>
  <!-- TODO: 截屏 -->
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';
import { ISite, ISiteCreate, ITopic } from '@/interfaces';
import Topic from '@/views/main/Topic.vue';
import { apiTopic } from '@/api/topic';
import { apiSite } from '@/api/site';
import { tryApi } from '@/store/main/actions';
import TopicChip from '@/components/widgets/TopicChip.vue';
import { api2 } from '@/api2';
import { commitAddNotification } from '@/store/main/mutations';
import SiteBtn from '@/components/SiteBtn.vue';

@Component({
  components: { SiteBtn, TopicChip, Topic },
})
export default class SiteCreation extends CVue {
  @Prop() readonly site_creation!: ISiteCreate;
  @Prop() readonly applicantUuid!: string;
  private topic: ITopic | null = null;
  private existingSite: ISite | null = null;
  private intermediate: boolean = true;

  async mounted() {
    if (this.site_creation.category_topic_uuid) {
      this.topic = (await apiTopic.getTopic(this.site_creation.category_topic_uuid)).data;
    }
    await tryApi(this.$store, async () => {
      this.existingSite = (await apiSite.getSite(this.site_creation.subdomain)).data;
    });
    this.intermediate = false;
  }

  async createSite() {
    this.intermediate = true;
    const r = (await apiSite.createSite(this.token, this.site_creation)).data;
    if (r.created_site) {
      this.existingSite = r.created_site;
      await api2.inviteUser(this.token, {
        site_uuid: r.created_site.uuid,
        user_uuid: this.applicantUuid,
      });
      await apiSite.updateSiteConfig(this.token, r.created_site.uuid, {
        moderator_uuid: this.applicantUuid,
      });
      commitAddNotification(this.$store, {
        color: 'success',
        content: '创建站点并设置管理员成功',
      });
    }
    this.intermediate = false;
  }
}
</script>
