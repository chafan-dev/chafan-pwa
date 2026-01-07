<template>
  <div>
    <v-btn color="primary" depressed small @click="showDialog = true"> 生成邀请链接 </v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >生成<span v-if="site">{{ site.name }}圈子的</span>邀请链接</span
          >
        </v-card-title>
        <v-card-text v-if="!invitationLinkHref">
          <div v-if="site === undefined" class="mt-3">
            <SiteSearch v-model="invitedSite" label="圈子（可选）" />
          </div>
        </v-card-text>
        <div v-if="invitationLinkHref" class="body-1 mx-6">
          <p class="black--text">✅ 未注册用户可直接通过以下链接进入注册界面：</p>
          <a :href="invitationLinkHref" class="text-decoration-none ml-1" target="_blank">
            https://cha.fan{{ invitationLinkHref }}
          </a>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="!invitationLinkHref"
            :disabled="intermediate"
            color="primary"
            depressed
            small
            @click="createInvitationLink"
          >
            生成邀请链接
            <v-progress-circular v-if="intermediate" indeterminate size="20" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';
import { IInvitationLinkCreate, ISite } from '@/interfaces';
import SiteSearch from '@/components/SiteSearch.vue';
import { useAuth } from '@/composables';

const props = defineProps<{
  site?: ISite;
}>();

const { token } = useAuth();

const invitedSite = ref<ISite | null>(null);
const showDialog = ref(false);
const intermediate = ref(false);
const invitationLinkHref = ref<string | null>(null);

async function createInvitationLink() {
  const payload: IInvitationLinkCreate = {};
  if (props.site !== undefined) {
    payload.invited_to_site_uuid = props.site.uuid;
  } else if (invitedSite.value) {
    payload.invited_to_site_uuid = invitedSite.value.uuid;
  }
  const invitationLink = (await api.createInvitationLink(token.value, payload)).data;
  invitationLinkHref.value = `/invitation-links/${invitationLink.uuid}`;
}
</script>
