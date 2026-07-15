<template>
  <div>
    <v-btn color="primary" variant="flat" size="small" @click="showDialog = true"> 添加站内用户 </v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">添加站内用户</span>
        </v-card-title>
        <v-card-text>
          <UserSearch v-model="friendId" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="intermediate"
            color="primary"
            variant="flat"
            size="small"
            @click="submitInviteFriends"
          >
            确认添加
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
import UserSearch from '@/components/UserSearch.vue';
import { ISite } from '@/interfaces';
import { useAuth, useNotification } from '@/composables';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const props = defineProps<{
  site: ISite;
}>();

const { token } = useAuth();
const { notifyError, expectOkAndCommitMsg } = useNotification();

const friendId = ref<string | null>(null);
const showDialog = ref(false);
const intermediate = ref(false);

async function submitInviteFriends() {
  intermediate.value = true;
  await store.captureApiError(async () => {
    if (!friendId.value) {
      notifyError('用户不能为空');
      return;
    }
    const response = await api.inviteUser(token.value, {
      site_uuid: props.site.uuid,
      user_uuid: friendId.value,
    });
    if (response) {
      expectOkAndCommitMsg(response.data, '已邀请');
      intermediate.value = false;
      showDialog.value = false;
      setTimeout(() => {
        friendId.value = null;
      }, 100);
    }
  });
}
</script>
