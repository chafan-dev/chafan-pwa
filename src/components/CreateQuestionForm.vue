<template>
  <v-card outlined>
    <v-card-title v-if="showTitle" class="primary--text headline"> 提问 </v-card-title>
    <v-card-text>
      <SiteSearch v-if="site === undefined" v-model="selectedSite" label="圈子（默认：大广场）" />
      <v-textarea
        class="mt-4"
        v-model="newQuestionTitle"
        auto-grow
        dense
        label="标题"
        rows="3"
        hide-details
      />
      <div class="d-flex">
        <v-spacer />
        <span class="text-caption grey--text"> 创建后添加细节 </span>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn :disabled="intermediate" color="primary" depressed small @click="postNewQuestion">
        提交新问题
        <v-progress-circular v-if="intermediate" indeterminate size="20" />
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Invite from '@/components/Invite.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import { CVue } from '@/common';
import SiteSearch from '@/components/SiteSearch.vue';
import { defaultSiteUuid } from '@/env';

@Component({
  components: { SiteSearch, UserLink, Invite },
})
export default class CreateQuestionForm extends CVue {
  @Prop() private readonly site: ISite | undefined;
  @Prop({ default: false }) private readonly showTitle!: boolean;

  private newQuestionTitle: string = '';
  private intermediate = false;
  private selectedSite: ISite | null = null;

  private async postNewQuestion() {
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
    if (this.newQuestionTitle.length < 5) {
      commitAddNotification(this.$store, {
        content: '标题太短了',
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      const response = await apiQuestion.postQuestion(this.token, {
        site_uuid: siteUUID,
        title: this.newQuestionTitle,
      });
      this.intermediate = false;
      if (response) {
        try {
          localStorage.setItem('new-question', 'true');
        } catch (e) {}
        await this.$router.push(`/questions/${response.data.uuid}`);
      }
    });
  }
}
</script>
