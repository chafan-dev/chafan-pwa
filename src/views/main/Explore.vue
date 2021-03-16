<template>
  <v-container fluid>
    <v-row justify="center" fluid>
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">
            {{ $t('探索') }}
          </div>
          <v-tabs>
            <v-tab>
              {{ $t('发现问题') }}
            </v-tab>
            <v-tab>
              {{ $t('所有圈子') }}
            </v-tab>
            <v-tab>
              {{ $t('关注更多用户') }}
            </v-tab>

            <v-tab-item>
              <div v-if="interestingQuestions !== null" class="pb-2">
                <QuestionPreview
                  v-for="questionPreview in interestingQuestions"
                  :key="questionPreview.uuid"
                  class="mx-2 my-4"
                  :class="{
                    'px-3': $vuetify.breakpoint.mdAndUp,
                    'py-4': $vuetify.breakpoint.mdAndUp,
                    'px-2': !$vuetify.breakpoint.mdAndUp,
                    'py-3': !$vuetify.breakpoint.mdAndUp,
                  }"
                  :questionPreview="questionPreview"
                />
              </div>
              <v-skeleton-loader type="paragraph" v-else />
              <p class="mt-2 text-center">{{ $t('不定期随机更新') }}</p>
            </v-tab-item>
            <v-tab-item>
              <ExploreSitesGrid />
            </v-tab-item>
            <v-tab-item>
              <div v-if="interestingUsers !== null">
                <UserGrid :users="interestingUsers" />
              </div>
              <v-skeleton-loader type="paragraph" v-else />
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

@Component({
  components: { UserGrid, QuestionPreview, ExploreSitesGrid },
})
export default class Explore extends Vue {
  private interestingQuestions: IQuestionPreview[] | null = null;
  private interestingUsers: IUserPreview[] | null = null;
  get token() {
    return this.$store.state.main.token;
  }
  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.interestingQuestions = (await apiDiscovery.getInterestingQuestions(this.token)).data;
      this.interestingUsers = (await apiDiscovery.getInterestingUsers(this.token)).data;
    });
  }
}
</script>
