<template>
  <div>
    <v-btn small depressed @click="showDialog = true" color="primary">{{
      $t('生成邀请链接')
    }}</v-btn>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('生成邀请链接') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="!site" class="mt-3">
            <v-autocomplete
              :items="sites"
              v-model="invitedSiteId"
              :label="`${$t('Circle')}` + ` (${$t('可选')})`"
              item-text="name"
              item-value="uuid"
              v-if="sites"
            >
              <template v-slot:prepend><SiteIcon /></template>
            </v-autocomplete>
          </div>
          <div v-else>{{ $t('加入圈子：') }} <SiteBtn :site="site" /></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            depressed
            @click="createInvitationLink"
            :disabled="intermediate"
            color="primary"
          >
            {{ $t('生成邀请链接') }}
            <v-progress-circular size="20" v-if="intermediate" indeterminate />
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

@Component({
  components: { UserSearch, AccountIcon, ShieldCheckIcon, SiteIcon, SiteBtn },
})
export default class Invite extends Vue {
  @Prop() public readonly site: ISite | undefined;

  private sites: ISite[] = [];
  private siteProfiles: IUserSiteProfile[] = [];

  private friendEmail: string = '';
  private friendId: string | null = null;
  private invitedSiteId: string | null = null;
  private showDialog = false;
  private intermediate = false;
  private myToken: string | null = null;

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

  private async mounted() {
    this.myToken = this.$store.state.main.token;
    if (this.site === undefined) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.$store.state.main.token)).data;
        const responses = await Promise.all(
          this.siteProfiles.map((p) => api.getSite(this.$store.state.main.token, p.site.subdomain))
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
    let routeData = this.$router.resolve({
      path: `/invitation-links/${invitationLink.uuid}`,
    });
    window.open(routeData.href, '_blank');
  }
}
</script>
