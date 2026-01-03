<template>
  <div class="d-flex align-end">
    <v-autocomplete
      v-if="enableAutoComplete"
      v-model="selectedUserUUID"
      :item-text="getItemText"
      :items="userPreviews"
      label="用户名"
      :loading="loading"
      :search-input.sync="search"
      cache-items
      hide-details
      hide-no-data
      placeholder="搜索..."
      item-value="uuid"
      @input="$emit('input', selectedUserUUID)"
    ></v-autocomplete>
    <div class="tw-w-full" v-else>
      <div class="d-flex align-end">
        <v-text-field
          placeholder="输入关键字..."
          hide-details
          v-model="query"
          @keydown.enter="doManualSearch"
        />
        <SearchIcon @click="doManualSearch" />
      </div>
      <v-select
        v-if="showInputSelections"
        hide-details
        :item-text="getItemText"
        :items="userPreviews"
        :placeholder="'返回' + userPreviews.length + '条，选择一个搜索结果'"
        cache-items
        item-value="uuid"
        v-model="selectedUserUUID"
        @input="$emit('input', selectedUserUUID)"
      />
    </div>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <SettingsIcon v-bind="attrs" v-on="on" />
      </template>
      <v-list dense>
        <v-list-item v-if="enableAutoComplete" @click="setEnableAutoComplete(false)">
          停用自动补全
        </v-list-item>
        <v-list-item v-else @click="setEnableAutoComplete(true)"> 启用自动补全 </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { apiSearch } from '@/api/search';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import { getLocalValue, setLocalValue } from '@/utils';
import SearchIcon from '@/components/icons/SearchIcon.vue';
import { IUserPreview } from '@/interfaces';
import { useAuth } from '@/composables';

const ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY = 'chafan.enable-user-search-auto-complete';

const props = withDefaults(
  defineProps<{
    returnSelf?: boolean;
  }>(),
  {
    returnSelf: true,
  }
);

const emit = defineEmits<{
  (e: 'input', value: string | null): void;
}>();

const { token, userProfile } = useAuth();

const loading = ref(false);
const query = ref('');
const search = ref<string | null>(null);
const userPreviews = ref<IUserPreview[]>([]);
const selectedUserUUID = ref<string | null>(null);
const enableAutoComplete = ref(getLocalValue(ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY, 'true') === 'true');
const showInputSelections = ref(false);

watch(search, (val) => {
  doSearch(val);
});

function doSearch(val: string | null) {
  if (val && val.startsWith('@')) {
    val = val.substring(1);
  }
  if (val && val !== selectedUserUUID.value) {
    querySelections(val);
  }
}

async function querySelections(v: string) {
  loading.value = true;
  const response = await apiSearch.searchUsers(token.value, v);
  let previews = response.data;
  if (!props.returnSelf) {
    previews = previews.filter(
      (userPreview: IUserPreview) => userPreview.uuid !== userProfile.value?.uuid
    );
  }
  userPreviews.value = previews;
  loading.value = false;
}

function getItemText(item: IUserPreview) {
  let name = `@${item.handle}`;
  if (item.full_name) {
    name = `${item.full_name} (@${item.handle})`;
  }
  return name;
}

function setEnableAutoComplete(flag: boolean) {
  setLocalValue(ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY, flag.toString());
  enableAutoComplete.value = flag;
}

function doManualSearch() {
  doSearch(query.value);
  showInputSelections.value = true;
}
</script>
