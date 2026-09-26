<template>
  <div>
    <v-btn
      :loading="intermediate"
      color="primary"
      variant="flat"
      size="small"
      @click="openInvitationLink"
    >
      生成邀请链接
    </v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card v-if="invitationLinkUrl">
        <v-card-title>
          <span class="text-h5"><span v-if="site">{{ site.name }}圈子的</span>邀请链接</span>
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="text-black">✅ 未注册用户可直接通过以下链接进入注册界面：</p>
          <a :href="invitationLinkUrl" class="text-decoration-none text-break" target="_blank">
            {{ invitationLinkUrl }}
          </a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="flat" size="small" @click="copyInvitationLink">
            {{ copied ? '已复制' : '复制链接' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apiInvitations } from '@/api/invitations';
import { IInvitationLinkCreate, ISite } from '@/interfaces';
import { useAuth } from '@/composables';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const props = defineProps<{
  site?: ISite;
}>();

const { token } = useAuth();

const showDialog = ref(false);
const intermediate = ref(false);
const invitationLinkUrl = ref<string | null>(null);
const copied = ref(false);

async function openInvitationLink() {
  // Reopening shows the link already generated instead of minting another one.
  if (!invitationLinkUrl.value) {
    intermediate.value = true;
    await store.captureApiError(async () => {
      const payload: IInvitationLinkCreate = {};
      if (props.site !== undefined) {
        payload.invited_to_site_uuid = props.site.uuid;
      }
      const invitationLink = (await apiInvitations.createInvitationLink(token.value, payload))
        .data;
      invitationLinkUrl.value = `${window.location.origin}/invitation-links/${invitationLink.uuid}`;
    });
    intermediate.value = false;
  }
  if (invitationLinkUrl.value) {
    showDialog.value = true;
  }
}

async function copyInvitationLink() {
  try {
    await navigator.clipboard.writeText(invitationLinkUrl.value!);
    copied.value = true;
  } catch {
    // Clipboard access is denied over plain http and in some embedded
    // browsers. The link is on screen, so the user can still copy it by hand.
    copied.value = false;
  }
}
</script>
