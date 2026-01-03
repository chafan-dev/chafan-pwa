<template>
  <div>
    <v-btn color="primary" depressed small @click="showDialog = true"> 添加站内用户 </v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">添加站内用户</span>
        </v-card-title>
        <v-card-text>
          <UserSearch v-model="friendId" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="intermediate"
            color="primary"
            depressed
            small
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
import { api2 } from '@/api2';
import UserSearch from '@/components/UserSearch.vue';
import { ISite } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { useAuth, useNotification } from '@/composables';
import store from '@/store';

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
  await dispatchCaptureApiError(store, async () => {
    if (!friendId.value) {
      notifyError('用户不能为空');
      return;
    }
    const response = await api2.inviteUser(token.value, {
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
