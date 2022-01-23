<template>
  <v-card outlined>
    <ValidationObserver v-slot="{ handleSubmit }">
      <v-card-title v-if="showTitle" class="primary--text headline"> 分享 </v-card-title>
      <v-card-text>
        <SiteSearch v-if="site === undefined" v-model="selectedSite" label="圈子（默认：大广场）" />
        <v-textarea
          class="mt-4"
          v-model="newSubmissionTitle"
          auto-grow
          dense
          label="标题"
          rows="1"
          hide-details
        />
        <ValidationProvider v-slot="{ errors }" name="URL" rules="url">
          <v-text-field v-model="newSubmissionURL" label="URL（可选）" hide-details clearable />
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
import { Component, Prop } from 'vue-property-decorator';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Invite from '@/components/Invite.vue';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';
import { CVue } from '@/common';
import SiteSearch from '@/components/SiteSearch.vue';
import { defaultSiteUuid } from '@/env';
import { AxiosError } from 'axios';

@Component({
  components: { SiteSearch, UserLink, Invite },
})
export default class CreateSubmissionForm extends CVue {
  @Prop() private readonly site: ISite | undefined;
  @Prop({ default: false }) private readonly showTitle!: boolean;

  private newSubmissionTitle: string = '';
  private newSubmissionURL: string | null = null;
  private postNewSubmissionIntermediate = false;
  private selectedSite: ISite | null = null;

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
      siteUUID = defaultSiteUuid;
    }
    if (this.newSubmissionTitle.length < 5) {
      commitAddNotification(this.$store, {
        content: '标题太短了',
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
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
      },
      errorFilter: (err: AxiosError) => {
        this.postNewSubmissionIntermediate = false;
        return false;
      },
    });
  }
}
</script>
