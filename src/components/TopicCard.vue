<template>
  <div>
    <v-card-title primary-title>
      <div class="headline primary--text">话题：{{ topic.name }}</div>
    </v-card-title>
    <v-card-text v-if="topicSubscription">
      <div v-if="parentTopic">
        <span>所属话题：</span>
        <v-chip :to="'/topics/' + parentTopic.uuid">{{ parentTopic.name }}</v-chip>
      </div>
      <div class="mt-2">
        <v-btn
          v-if="topicSubscription.subscribed_by_me"
          :disabled="cancelSubscriptionIntermediate"
          depressed
          small
          @click="cancelSubscription"
        >
          已关注 ({{ topicSubscription.subscription_count }})
        </v-btn>
        <v-btn
          v-else
          :disabled="subscribeIntermediate"
          color="primary"
          depressed
          small
          @click="subscribe"
        >
          关注 ({{ topicSubscription.subscription_count }})
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
import { Component, Prop } from 'vue-property-decorator';
import { apiTopic } from '@/api/topic';
import { CVue } from '@/common';

@Component({
  components: { TopicSearch },
})
export default class TopicCard extends CVue {
  @Prop() public readonly topic!: ITopic;
  private topicSubscription: IUserTopicSubscription | null = null;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private parentTopic: ITopic | null = null;

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response3 = await apiMe.getTopicSubscription(this.token, this.topic.uuid);
      this.topicSubscription = response3.data;
    });
    if (this.topic.parent_topic_uuid) {
      this.parentTopic = (await apiTopic.getTopic(this.topic.parent_topic_uuid)).data;
    }
  }

  public async cancelSubscription() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.topic) {
        this.cancelSubscriptionIntermediate = true;
        const r = await apiMe.unsubscribeTopic(this.token, this.topic.uuid);
        this.cancelSubscriptionIntermediate = false;
        this.topicSubscription = r.data;
      }
    });
  }

  public async subscribe() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.topic) {
        this.subscribeIntermediate = true;
        const r = await apiMe.subscribeTopic(this.token, this.topic.uuid);
        this.subscribeIntermediate = false;
        this.topicSubscription = r.data;
      }
    });
  }
}
</script>
