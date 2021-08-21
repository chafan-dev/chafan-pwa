<template>
  <v-card>
    <ValidationObserver v-slot="{ handleSubmit }">
      <v-card-title v-if="showTitle" class="primary--text headline"> 分享 </v-card-title>
      <v-card-text>
        <v-autocomplete
          v-if="site === undefined"
          v-model="selectedSite"
          :items="siteProfiles"
          item-text="site.name"
          item-value="site"
          label="圈子 (加入后在此处可见, 「大广场」不限话题)"
        />
        <v-textarea v-model="newSubmissionTitle" auto-grow dense label="标题" rows="1" />
        <ValidationProvider v-slot="{ errors }" name="URL" rules="url">
          <v-text-field v-model="newSubmissionURL" label="URL（可选）" />
          <span class="error--text">{{ errors[0] }}</span>
        </ValidationProvider>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="postNewSubmissionIntermediate"
          color="primary"
          depressed
          small
          @click="handleSubmit(postNewSubmission)"
        >
          提交
          <v-progress-circular v-if="postNewSubmissionIntermediate" indeterminate size="20" />
        </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script lang="ts">
import { apiSubmission } from '@/api/submission';
import { Component, Prop, Vue } from 'vue-property-decorator';
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

  get token() {
    return readToken(this.$store);
  }

  public async mounted() {
    // FIXME: Cache user's site profile on the client side
    if (this.site === undefined && this.token) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.token)).data;
      });
    }
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
        content: '所选圈子不能为空',
        color: 'error',
      });
      return;
    }
    if (this.newSubmissionTitle.length < 5) {
      commitAddNotification(this.$store, {
        content: '标题太短了',
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
        await this.$router.push(`/submissions/${response.data.uuid}`);
      }
    });
  }
}
</script>
