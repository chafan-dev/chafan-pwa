<template>
  <div ref="rootEl">
    <v-menu
      v-model="showSearchResults"
      :close-on-content-click="false"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      allow-overflow
      max-height="600"
      offset-y
    >
      <div style="min-width: 220px">
        <SearchResults ref="searchResults" :onReady="onReady" :query="currentQuery" />
        <div style="background: white">
          <v-divider class="mx-1 mb-1" />
          <div class="d-flex pb-1 pr-1">
            <v-spacer />
            <v-btn color="secondary" depressed outlined small @click="openInNew">
              新页面打开
            </v-btn>
          </div>
        </div>
      </div>
    </v-menu>
    <v-text-field
      v-model="searchInput"
      dense
      filled
      hide-details
      outlined
      placeholder="搜索"
      @input="searchDebounced"
      @keydown.enter="search"
    >
      <template v-slot:append>
        <v-progress-circular v-if="loading" indeterminate size="25" width="2" />
        <SearchIcon v-else @click="search" />
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router/composables';
import SearchIcon from '@/components/icons/SearchIcon.vue';
import SearchResults from '@/components/SearchResults.vue';

const router = useRouter();

const loading = ref(false);
const timerId = ref<any>(null);
const searchInput = ref<string | null>(null);
const showSearchResults = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const currentQuery = ref<string | null>(null);

const rootEl = ref<HTMLElement | null>(null);
const searchResults = ref<InstanceType<typeof SearchResults> | null>(null);

onMounted(() => {
  if (rootEl.value) {
    for (const e of rootEl.value.getElementsByTagName('input')) {
      const inputElem = e as HTMLInputElement;
      inputElem.autocomplete = 'off';
    }
  }
});

function searchDebounced() {
  if (timerId.value !== null) {
    clearTimeout(timerId.value);
  }
  timerId.value = setTimeout(search, 1000);
}

function search() {
  if (searchInput.value === currentQuery.value) {
    return;
  }
  let val = searchInput.value;
  if (val && val.startsWith('@')) {
    val = val.substring(1);
  }
  if (val) {
    querySelections(val);
  }
}

function onReady() {
  loading.value = false;
}

async function querySelections(v: string) {
  loading.value = true;
  if (showSearchResults.value) {
    await searchResults.value?.doSearch(v);
  } else {
    currentQuery.value = v;
  }
  if (rootEl.value) {
    menuY.value = rootEl.value.getBoundingClientRect().bottom;
    menuX.value = rootEl.value.getBoundingClientRect().left;
  }
  showSearchResults.value = true;
}

function openInNew() {
  showSearchResults.value = false;
  router.push({ path: '/search', query: { q: currentQuery.value || undefined } });
}
</script>
