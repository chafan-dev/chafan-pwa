<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row v-else class="mb-12" justify="center">
      <v-col :class="{ 'col-6': $vuetify.breakpoint.mdAndUp }">
        <ChatWindow :channel="channel" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import store from '@/store';
import { useRoute } from 'vue-router/composables';
import { api } from '@/api';
import { IChannel } from '@/interfaces';
import ChatWindow from '@/components/ChatWindow.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';

const route = useRoute();

const channel = ref<IChannel | null>(null);
const loading = ref(true);

const id = computed(() => parseInt(route.params.id as string, 10));
const token = computed(() => store.state.main.token);

async function load() {
  await dispatchCaptureApiError(store, async () => {
    channel.value = (await api.getChannel(token.value, id.value)).data;
    loading.value = false;
  });
}

// Watch for route param changes (replaces beforeRouteUpdate)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId && route.name === 'channel') {
    loading.value = true;
    load();
  }
});

onMounted(async () => {
  await load();
});
</script>
