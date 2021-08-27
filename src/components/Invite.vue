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

<script lang="ts">
import { api2 } from '@/api2';
import { Component, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import UserSearch from '@/components/UserSearch.vue';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import SiteIcon from '@/components/icons/SiteIcon.vue';
import ShieldCheckIcon from '@/components/icons/ShieldCheckIcon.vue';
import { ISite } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readToken } from '@/store/main/getters';
import { CVue } from '@/common';

@Component({
  components: { UserSearch, AccountIcon, ShieldCheckIcon, SiteIcon },
})
export default class Invite extends CVue {
  @Prop() public readonly site!: ISite;

  private friendId: string | null = null;
  private showDialog = false;
  private intermediate = false;

  private async submitInviteFriends() {
    this.intermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (!this.friendId) {
        commitAddNotification(this.$store, {
          content: '用户不能为空',
          color: 'error',
        });
        return;
      }
      const response = await api2.inviteUser(readToken(this.$store), {
        site_uuid: this.site.uuid,
        user_uuid: this.friendId,
      });
      if (response) {
        this.expectOkAndCommitMsg(response.data, '已邀请');
        this.intermediate = false;
        this.showDialog = false;
        setTimeout(() => {
          this.friendId = null;
        }, 100);
      }
    });
  }
}
</script>
