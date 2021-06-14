<template>
  <div>
    <v-btn color="primary" depressed small @click="showDialog = true"
      >{{ $t('生成邀请链接') }}
    </v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('生成邀请链接') }}</span>
        </v-card-title>
        <v-card-text v-if="!invitationLinkHref">
          <div v-if="!site" class="mt-3">
            <v-autocomplete
              v-if="sites"
              v-model="invitedSiteId"
              :items="sites"
              :label="`${$t('Circle')}` + ` (${$t('可选')})`"
              item-text="name"
              item-value="uuid"
            >
              <template v-slot:prepend>
                <SiteIcon />
              </template>
            </v-autocomplete>
          </div>
          <div v-else>
            {{ $t('加入圈子：') }}
            <SiteBtn :site="site" />
          </div>
        </v-card-text>
        <div v-if="invitationLinkHref" class="body-1 mx-6">
          <p class="black--text">{{ $t('✅ 未注册用户可直接通过以下链接进入注册界面') }}:</p>
          <a :href="invitationLinkHref" class="text-decoration-none ml-1" target="_blank"
            >https://cha.fan{{ invitationLinkHref }}</a
          >
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
            {{ $t('生成邀请链接') }}
            <v-progress-circular v-if="intermediate" indeterminate size="20" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { Component, Vue, Prop } from 'vue-property-decorator';
import UserSearch from '@/components/UserSearch.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import SiteIcon from '@/components/icons/SiteIcon.vue';
import ShieldCheckIcon from '@/components/icons/ShieldCheckIcon.vue';
import { IInvitationLinkCreate, ISite, IUserSiteProfile } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { apiSite } from '@/api/site';

@Component({
  components: { UserSearch, AccountIcon, ShieldCheckIcon, SiteIcon, SiteBtn },
})
export default class NewInviteLinkBtn extends Vue {
  @Prop() public readonly site: ISite | undefined;

  private sites: ISite[] = [];
  private siteProfiles: IUserSiteProfile[] = [];

  private friendEmail: string = '';
  private friendId: string | null = null;
  private invitedSiteId: string | null = null;
  private showDialog = false;
  private intermediate = false;

  private invitedPersonalRelation: string = 'unknown';
  private readonly invitedPersonalRelationItems = [
    {
      text: this.$t('知道实名身份的朋友'),
      code: 'real',
    },
    {
      text: this.$t('仅知道线上身份的朋友'),
      code: 'online',
    },
    {
      text: this.$t('不了解其任何身份'),
      code: 'unknown',
    },
  ];
  private invitationLinkHref: string | null = null;

  private async mounted() {
    if (this.site === undefined) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.$store.state.main.token)).data;
        const responses = await Promise.all(
          this.siteProfiles.map((p) => apiSite.getSite(p.site.subdomain))
        );
        this.sites = responses.map((r) => r.data);
      });
    }
  }

  private async createInvitationLink() {
    const payload: IInvitationLinkCreate = {};
    if (this.site !== undefined) {
      payload.invited_to_site_uuid = this.site.uuid;
    } else if (this.invitedSiteId !== null) {
      payload.invited_to_site_uuid = this.invitedSiteId;
    }
    const invitationLink = (await api.createInvitationLink(this.$store.state.main.token, payload))
      .data;
    this.invitationLinkHref = `/invitation-links/${invitationLink.uuid}`;
  }
}
</script>
