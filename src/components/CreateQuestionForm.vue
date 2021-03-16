<template>
  <base-card
    v-bind="$attrs"
    :class="{ 'py-4 px-2': site === undefined }"
    :embedded="true"
    :no-gutter="site !== undefined"
  >
    <div>
      <v-sheet>
        <v-textarea
          v-model="newQuestionTitle"
          :label="`${$t('Title')}*`"
          auto-grow
          hide-details
          outlined
          rows="4"
        />
      </v-sheet>

      <div class="d-flex justify-end mt-4">
        <v-sheet max-width="200">
          <v-autocomplete
            v-if="site === undefined"
            v-model="selectedSite"
            :class="{ 'rounded-r-0': site === undefined }"
            :items="siteProfiles"
            :label="`${$t('Circle')}*`"
            dense
            hide-details
            item-text="site.name"
            item-value="site"
            outlined
          />
        </v-sheet>

        <v-btn
          :class="{ 'rounded-l-0': site === undefined }"
          :disabled="intermediate"
          :height="site === undefined ? 40 : 28"
          color="primary"
          depressed
          small
          @click="postNewQuestion"
        >
          {{ $t('提交新问题') }}
          <v-progress-circular v-if="intermediate" intermediate size="20" />
        </v-btn>
      </div>
    </div>
  </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite, IUserSiteProfile } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Invite from '@/components/Invite.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { api } from '@/api';
import BaseCard from '@/components/base/BaseCard.vue';

@Component({
  components: { BaseCard, UserLink, Invite },
})
export default class CreateQuestionForm extends Vue {
  @Prop() private readonly site: ISite | undefined;
  @Prop({ default: false }) private readonly showTitle!: boolean;

  private newQuestionTitle: string = '';
  private intermediate = false;
  private siteProfiles: IUserSiteProfile[] = [];
  private selectedSite: ISite | null = null;

  get token() {
    return this.$store.state.main.token;
  }

  private async mounted() {
    // FIXME: Cache user's site profile on the client side
    if (this.site === undefined && this.token) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.token)).data;
      });
    }
  }

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
      commitAddNotification(this.$store, {
        content: this.$t('所选圈子不能为空').toString(),
        color: 'error',
      });
      return;
    }
    if (this.newQuestionTitle.length < 5) {
      commitAddNotification(this.$store, {
        content: this.$t('Title is too short: minimum length 5 characters.').toString(),
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      const response = await api.postQuestion(this.token, {
        site_uuid: siteUUID,
        title: this.newQuestionTitle,
      });
      this.intermediate = false;
      if (response) {
        try {
          localStorage.setItem('new-question', 'true');
        } catch (e) {}
        this.$router.push(`/questions/${response.data.uuid}`);
      }
    });
  }
}
</script>
