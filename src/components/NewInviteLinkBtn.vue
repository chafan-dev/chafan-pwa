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

<script lang="ts">
import { api } from '@/api';
import { Component, Prop } from 'vue-property-decorator';
import UserSearch from '@/components/UserSearch.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import SiteIcon from '@/components/icons/SiteIcon.vue';
import ShieldCheckIcon from '@/components/icons/ShieldCheckIcon.vue';
import { IInvitationLinkCreate, ISite } from '@/interfaces';
import SiteSearch from '@/components/SiteSearch.vue';
import { CVue } from '@/common';

@Component({
  components: { SiteSearch, UserSearch, AccountIcon, ShieldCheckIcon, SiteIcon, SiteBtn },
})
export default class NewInviteLinkBtn extends CVue {
  @Prop() public readonly site: ISite | undefined;

  private invitedSite: ISite | null = null;
  private showDialog = false;
  private intermediate = false;
  private invitationLinkHref: string | null = null;

  private async createInvitationLink() {
    const payload: IInvitationLinkCreate = {};
    if (this.site !== undefined) {
      payload.invited_to_site_uuid = this.site.uuid;
    } else if (this.invitedSite !== null) {
      payload.invited_to_site_uuid = this.invitedSite.uuid;
    }
    const invitationLink = (await api.createInvitationLink(this.token, payload)).data;
    this.invitationLinkHref = `/invitation-links/${invitationLink.uuid}`;
  }
}
</script>
