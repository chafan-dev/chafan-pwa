<template>
  <div class="ma-3 pa-3">
    <v-card-title primary-title>
      <div class="headline primary--text">{{ $t('话题：') }} {{ topic.name }}</div>
    </v-card-title>
    <v-card-text v-if="topicSubscription">
      <div v-if="parentTopic">
        <span>{{ $t('所属话题：') }}</span>
        <v-chip :to="'/topics/' + parentTopic.uuid">{{ parentTopic.name }}</v-chip>
      </div>
      <div class="mt-2">
        <v-btn
          v-if="topicSubscription.subscribed_by_me"
          :disabled="cancelSubscriptionIntermediate"
          @click="cancelSubscription"
        >
          {{ $t('已关注') }} ({{ topicSubscription.subscription_count }})
        </v-btn>
        <v-btn v-else :disabled="subscribeIntermediate" color="primary" @click="subscribe">
          {{ $t('关注') }} ({{ topicSubscription.subscription_count }})
        </v-btn>
      </div>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import { apiMe } from '@/api/me';
import { ITopic, IUserTopicSubscription } from '@/interfaces';
import TopicSearch from '@/components/TopicSearch.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { apiTopic } from '@/api/topic';

@Component({
  components: { TopicSearch },
})
export default class TopicCard extends Vue {
  @Prop() public readonly topic!: ITopic;
  private topicSubscription: IUserTopicSubscription | null = null;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private parentTopic: ITopic | null = null;

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response3 = await apiMe.getTopicSubscription(
        this.$store.state.main.token,
        this.topic.uuid
      );
      this.topicSubscription = response3.data;
    });
    if (this.topic.parent_topic_uuid) {
      this.parentTopic = (
        await apiTopic.getTopic(this.$store.state.main.token, this.topic.parent_topic_uuid)
      ).data;
    }
  }

  public async cancelSubscription() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.topic) {
        this.cancelSubscriptionIntermediate = true;
        const r = await apiMe.unsubscribeTopic(this.$store.state.main.token, this.topic.uuid);
        this.cancelSubscriptionIntermediate = false;
        this.topicSubscription = r.data;
      }
    });
  }

  public async subscribe() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.topic) {
        this.subscribeIntermediate = true;
        const r = await apiMe.subscribeTopic(this.$store.state.main.token, this.topic.uuid);
        this.subscribeIntermediate = false;
        this.topicSubscription = r.data;
      }
    });
  }
}
</script>
