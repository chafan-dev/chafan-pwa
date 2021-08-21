<template>
  <v-container fluid>
    <v-row fluid justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">
            {{ $t('探索') }}
          </div>
          <v-tabs v-model="currentTabItem">
            <v-tab href="#questions">
              {{ $t('发现问题') }}
            </v-tab>
            <v-tab href="#sites">
              {{ $t('所有圈子') }}
            </v-tab>
            <v-tab href="#users">
              {{ $t('关注更多用户') }}
            </v-tab>

            <v-tab-item class="mt-2" eager value="questions">
              <div v-if="interestingQuestions !== null" class="pb-2">
                <QuestionPreview
                  v-for="questionPreview in interestingQuestions"
                  :key="questionPreview.uuid"
                  :questionPreview="questionPreview"
                />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
              <p class="mt-2 text-center">{{ $t('不定期随机更新') }}</p>
            </v-tab-item>
            <v-tab-item class="mt-2" eager value="sites">
              <ExploreSitesGrid />
            </v-tab-item>
            <v-tab-item class="mt-2" eager value="users">
              <div v-if="interestingUsers !== null">
                <UserGrid :users="interestingUsers" />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
              <p class="mt-2 text-center">{{ $t('不定期随机更新') }}</p>
            </v-tab-item>
          </v-tabs>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { apiDiscovery } from '@/api/discovery';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import { Component, Vue } from 'vue-property-decorator';
import { IQuestionPreview, IUserPreview } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import UserGrid from '@/components/UserGrid.vue';
import { readToken } from '@/store/main/getters';

@Component({
  components: { UserGrid, QuestionPreview, ExploreSitesGrid },
})
export default class Explore extends Vue {
  private interestingQuestions: IQuestionPreview[] | null = null;
  private interestingUsers: IUserPreview[] | null = null;

  get token() {
    return readToken(this.$store);
  }

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'questions';
  }

  set currentTabItem(tab) {
    if (tab !== 'questions') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.interestingQuestions = (await apiDiscovery.getInterestingQuestions(this.token)).data;
      this.interestingUsers = (await apiDiscovery.getInterestingUsers(this.token)).data;
    });
  }
}
</script>
