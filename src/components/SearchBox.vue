<template>
    <v-autocomplete
        outlined
        dense
        filled
        :loading="loadingQuestions && loadingUsers && loadingAnswers"
        :items="items"
        item-value="handle"
        :item-text="getItemText"
        :search-input.sync="search"
        hide-no-data
        hide-details
        :placeholder="$t('Search')">
        <template v-slot:item="{ item }">
            <v-list-item link target="_blank" :to="getItemLink(item)">
                {{getItemText(item)}}
                <v-spacer />
                <span class="grey--text pl-1">{{$t(item.type)}}</span>
            </v-list-item>
        </template>
        <template v-slot:append><SearchIcon /></template>
    </v-autocomplete>
</template>

<script>

import { apiSearch } from '@/api/search';
import SearchIcon from '@/components/icons/SearchIcon.vue';

export default {
    props: ["token"],
    components: { SearchIcon },
    data () {
        return {
            loadingQuestions: false,
            loadingAnswers: false,
            loadingUsers: false,
            items: [],
            search: null,
            states: [],
            timerId: null,
        }
    },
    watch: {
        search (val) {
            if (val && val.startsWith('@')) {
                val = val.substring(1);
            }
            if (val) {
                this.querySelectionsDebounced(val);
            }
        },
    },
    methods: {
        querySelectionsDebounced(v) {
            if (this.timerId !== null) {
                clearTimeout(this.timerId);
            }
            this.timerId = setTimeout(() => {
                this.querySelections(v);
            }, 500)
        },
        querySelections(v) {
            this.items = [];
            this.loadingUsers = true;
            apiSearch.searchUsers(this.token, v).then((response) => {
                response.data.forEach(user => {
                    this.items.push({
                        'type': 'user',
                        'data': user,
                    });
                });
                this.loadingUsers = false;
            });
            this.loadingQuestions = true;
            apiSearch.searchQuestions(this.token, v).then((response) => {
                response.data.forEach((question) => {
                    this.items.push({
                        'type': 'question',
                        'data': question,
                    });
                });
                this.loadingQuestions = false;
            });
            this.loadingAnswers = true;
            apiSearch.searchAnswers(this.token, v).then((response) => {
                response.data.forEach((answer) => {
                    this.items.push({
                        'type': 'answer',
                        'data': answer,
                    });
                });
                this.loadingAnswers = false;
            });
        },
        getItemText(item) {
            if (item.type === 'user') {
                let name = `@${item.data.handle}`;
                if (item.data.full_name) {
                    name = `${item.data.full_name} (@${item.data.handle})`;
                }
                return name;
            }
            if (item.type === 'question') {
                return item.data.title;
            }
            if (item.type === 'answer') {
                return item.data.body;
            }
        },
        getItemLink(item) {
            if (item.type === 'user') {
                return `/users/${item.data.handle}`;
            }
            if (item.type === 'question') {
                return `/questions/${item.data.uuid}`;
            }
            if (item.type === 'answer') {
                return `/questions/${item.data.question.uuid}/answers/${item.data.uuid}`;
            }
        }
    },
}
</script>