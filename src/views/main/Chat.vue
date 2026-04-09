<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row v-else class="mb-12" justify="center">
      <v-col :class="{ 'col-6': display.mdAndUp }">
        <ChatWindow :channel="channel" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { api } from '@/api';
import { IChannel } from '@/interfaces';
import ChatWindow from '@/components/ChatWindow.vue';
import { useAuth } from '@/composables';
import { useMainStore } from '@/stores/main';
const store = useMainStore();
const display = useDisplay();

const route = useRoute();
const { token } = useAuth();

const channel = ref<IChannel | null>(null);
const loading = ref(true);

const id = computed(() => parseInt(route.params.id as string, 10));

async function load() {
  await store.captureApiError(async () => {
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
