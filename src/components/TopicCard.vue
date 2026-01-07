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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiMe } from '@/api/me';
import { ITopic, IUserTopicSubscription } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiTopic } from '@/api/topic';
import { useAuth } from '@/composables';
import store from '@/store';

const props = defineProps<{
  topic: ITopic;
}>();

const { token } = useAuth();

const topicSubscription = ref<IUserTopicSubscription | null>(null);
const cancelSubscriptionIntermediate = ref(false);
const subscribeIntermediate = ref(false);
const parentTopic = ref<ITopic | null>(null);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    const response3 = await apiMe.getTopicSubscription(token.value, props.topic.uuid);
    topicSubscription.value = response3.data;
  });
  if (props.topic.parent_topic_uuid) {
    parentTopic.value = (await apiTopic.getTopic(props.topic.parent_topic_uuid)).data;
  }
});

async function cancelSubscription() {
  await dispatchCaptureApiError(store, async () => {
    if (props.topic) {
      cancelSubscriptionIntermediate.value = true;
      const r = await apiMe.unsubscribeTopic(token.value, props.topic.uuid);
      cancelSubscriptionIntermediate.value = false;
      topicSubscription.value = r.data;
    }
  });
}

async function subscribe() {
  await dispatchCaptureApiError(store, async () => {
    if (props.topic) {
      subscribeIntermediate.value = true;
      const r = await apiMe.subscribeTopic(token.value, props.topic.uuid);
      subscribeIntermediate.value = false;
      topicSubscription.value = r.data;
    }
  });
}
</script>
