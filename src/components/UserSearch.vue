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

<script>
import { apiSearch } from '@/api/search';
import { readToken, readUserProfile } from '@/store/main/getters';
import SettingsIcon from '@/components/icons/SettingsIcon';
import { getLocalValue, setLocalValue } from '@/utils';
import SearchIcon from '@/components/icons/SearchIcon';

const ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY = 'chafan.enable-user-search-auto-complete';

export default {
  components: { SearchIcon, SettingsIcon },
  props: {
    returnSelf: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const enable = getLocalValue(ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY, 'true') === 'true';
    return {
      loading: false,
      query: '',
      search: null,
      userPreviews: [],
      selectedUserUUID: null,
      enableAutoComplete: enable,
      showInputSelections: false,
    };
  },
  watch: {
    search(val) {
      this.doSearch(val);
    },
  },
  computed: {
    token() {
      return readToken(this.$store);
    },
    userProfile() {
      return readUserProfile(this.$store);
    },
  },
  methods: {
    doSearch(val) {
      if (val && val.startsWith('@')) {
        val = val.substring(1);
      }
      if (val && val !== this.selectedUserUUID) {
        this.querySelections(val);
      }
    },
    querySelections(v) {
      this.loading = true;
      apiSearch.searchUsers(this.token, v).then((response) => {
        let userPreviews = response.data;
        if (!this.returnSelf) {
          userPreviews = userPreviews.filter(
            (userPreview) => userPreview.uuid !== this.userProfile?.uuid
          );
        }
        this.userPreviews = userPreviews;
        this.loading = false;
      });
    },
    getItemText(item) {
      let name = `@${item.handle}`;
      if (item.full_name) {
        name = `${item.full_name} (@${item.handle})`;
      }
      return name;
    },
    setEnableAutoComplete(flag) {
      setLocalValue(ENABLE_USER_SEARCH_AUTO_COMPLETE_KEY, flag.toString());
      this.enableAutoComplete = flag;
    },
    doManualSearch() {
      this.doSearch(this.query);
      this.showInputSelections = true;
    },
  },
};
</script>
