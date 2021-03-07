<template>
    <span>
        <ExpandHorizontalIcon v-if="$vuetify.breakpoint.mdAndUp && isNarrowFeedUI" @click="setNarrowFeedUI(false)" />
        <CollapseHorizontalIcon v-else-if="$vuetify.breakpoint.mdAndUp" @click="setNarrowFeedUI(true)" />
    </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import ExpandHorizontalIcon from '@/components/icons/ExpandHorizontalIcon.vue';
import CollapseHorizontalIcon from '@/components/icons/CollapseHorizontalIcon.vue';
import { commitSetNarrowUI } from '@/store/main/mutations';
import { readNarrowUI } from '@/store/main/getters';

@Component({
    components: { ExpandHorizontalIcon, CollapseHorizontalIcon },
})
export default class UIStyleControllers extends Vue {
    get isNarrowFeedUI() {
      return readNarrowUI(this.$store);
    }

    private setNarrowFeedUI(value: boolean) {
        commitSetNarrowUI(this.$store, value);
        try {
            localStorage.removeItem('narrowFeedUI');
            localStorage.setItem('narrowFeedUI', value.toString());
        } catch (e) {}
    }
}
</script>