<template>
  <v-card>
    <ValidationObserver v-slot="{ handleSubmit }">
      <v-card-title class="primary--text headline" v-if="showTitle">
        {{ $t('分享') }}
      </v-card-title>
      <v-card-text>
        <v-autocomplete
          :label="$t('Circle')"
          :items="siteProfiles"
          item-value="site"
          item-text="site.name"
          v-model="selectedSite"
          v-if="site === undefined"
        />
        <v-textarea :label="$t('Title')" auto-grow dense rows="1" v-model="newSubmissionTitle" />
        <ValidationProvider name="URL" rules="url" v-slot="{ errors }">
          <v-text-field :label="$t('URL (optional)')" v-model="newSubmissionURL" />
          <span class="error--text">{{ errors[0] }}</span>
        </ValidationProvider>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          color="primary"
          @click="handleSubmit(postNewSubmission)"
          :disabled="postNewSubmissionIntermediate"
        >
          {{ $t('提交') }}
          <v-progress-circular size="20" intermediate v-if="postNewSubmissionIntermediate" />
        </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script lang="ts">
import { apiSubmission } from '@/api/submission';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite, IUserSiteProfile } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Invite from '@/components/Invite.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { readToken } from '@/store/main/getters';

@Component({
  components: { UserLink, Invite },
})
export default class CreateSubmissionForm extends Vue {
  @Prop() private readonly site: ISite | undefined;
  @Prop({ default: false }) private readonly showTitle!: boolean;

  private newSubmissionTitle: string = '';
  private newSubmissionURL: string | null = null;
  private postNewSubmissionIntermediate = false;
  private siteProfiles: IUserSiteProfile[] = [];
  private selectedSite: ISite | null = null;

  public async mounted() {
    // FIXME: Cache user's site profile on the client side
    if (this.site === undefined && this.token) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.token)).data;
      });
    }
  }

  get token() {
    return readToken(this.$store);
  }

  private async postNewSubmission() {
    if (!this.token) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    let siteUUID;
    if (this.site) {
      siteUUID = this.site.uuid;
    } else if (this.selectedSite) {
      siteUUID = this.selectedSite.uuid;
    } else {
      commitAddNotification(this.$store, {
        content: this.$t('所选圈子不能为空').toString(),
        color: 'error',
      });
      return;
    }
    if (this.newSubmissionTitle.length < 5) {
      commitAddNotification(this.$store, {
        content: this.$t('Title is too short: minimum length 5 characters.').toString(),
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.postNewSubmissionIntermediate = true;
      const response = await apiSubmission.postSubmission(this.token, {
        site_uuid: siteUUID,
        title: this.newSubmissionTitle,
        url: this.newSubmissionURL ? this.newSubmissionURL : undefined,
      });
      this.postNewSubmissionIntermediate = false;
      if (response) {
        try {
          localStorage.setItem('new-submission', 'true');
        } catch (e) {}
        this.$router.push(`/submissions/${response.data.uuid}`);
      }
    });
  }
}
</script>
