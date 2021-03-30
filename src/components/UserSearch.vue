<template>
  <v-autocomplete
    v-model="selectedUserUUID"
    :item-text="getItemText"
    :items="userPreviews"
    :label="$t('Username')"
    :loading="loading"
    :search-input.sync="search"
    cache-items
    hide-details
    hide-no-data
    item-value="uuid"
    @input="$emit('input', selectedUserUUID)"
  ></v-autocomplete>
</template>

<script>
import { apiSearch } from '@/api/search';
import { readToken } from '@/store/main/getters';

export default {
  data() {
    return {
      loading: false,
      userPreviews: [],
      search: null,
      selectedUserUUID: null,
      states: [],
    };
  },
  watch: {
    search(val) {
      if (val && val.startsWith('@')) {
        val = val.substring(1);
      }
      if (val && val !== this.selectedUserUUID) {
        this.querySelections(val);
      }
    },
  },
  computed: {
    token() {
      return readToken(this.$store);
    },
  },
  methods: {
    querySelections(v) {
      this.loading = true;
      apiSearch.searchUsers(this.token, v).then((response) => {
        this.userPreviews = response.data;
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
  },
};
</script>
