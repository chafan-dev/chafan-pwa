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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import store from '@/store';
import { ISite, ISiteCreate, ITopic } from '@/interfaces';
import { apiTopic } from '@/api/topic';
import { apiSite } from '@/api/site';
import { tryApi } from '@/store/main/actions';
import { api2 } from '@/api2';
import { commitAddNotification } from '@/store/main/mutations';
import SiteBtn from '@/components/SiteBtn.vue';
import { useAuth } from '@/composables';

const props = defineProps<{
  site_creation: ISiteCreate;
  applicantUuid: string;
}>();

const { token, userProfile } = useAuth();

const topic = ref<ITopic | null>(null);
const existingSite = ref<ISite | null>(null);
const intermediate = ref(true);

onMounted(async () => {
  if (props.site_creation.category_topic_uuid) {
    topic.value = (await apiTopic.getTopic(props.site_creation.category_topic_uuid)).data;
  }
  await tryApi(store, async () => {
    existingSite.value = (await apiSite.getSite(props.site_creation.subdomain)).data;
  });
  intermediate.value = false;
});

async function createSite() {
  intermediate.value = true;
  const r = (await apiSite.createSite(token.value, props.site_creation)).data;
  if (r.created_site) {
    existingSite.value = r.created_site;
    await api2.inviteUser(token.value, {
      site_uuid: r.created_site.uuid,
      user_uuid: props.applicantUuid,
    });
    await apiSite.updateSiteConfig(token.value, r.created_site.uuid, {
      moderator_uuid: props.applicantUuid,
    });
    commitAddNotification(store, {
      color: 'success',
      content: '创建站点并设置管理员成功',
    });
  }
  intermediate.value = false;
}
</script>
