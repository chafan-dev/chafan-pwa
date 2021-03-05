<template>
    <v-menu :open-on-hover="!$vuetify.breakpoint.mobile" bottom right offset-y open-delay="400">
        <template v-slot:activator="{ on, attrs }">
            <v-btn class="mr-1 mt-1" depressed :to="'/sites/' + site.subdomain" :color="color" v-bind="attrs" v-on="on">
                {{ site.name }}
                <PrivateSiteIcon class="ml-1" v-if="site.permission_type === 'private'" />
            </v-btn>
        </template>
        <v-lazy>
            <v-card max-width="400">
                <SiteCard :site="site" :showQuestionEditor="false" :showSubmissionEditor="false"
                          :showTopics="false" />
            </v-card>
        </v-lazy>
    </v-menu>
</template>

<script lang="ts">
import { ISite } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import PrivateSiteIcon from '@/components/icons/PrivateSiteIcon.vue';
import SiteCard from '@/components/SiteCard.vue';

function hashCode(str) {
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

@Component({
    components: { PrivateSiteIcon, SiteCard },
})
export default class SiteBtn extends Vue {
    @Prop() public readonly site!: ISite;

    get color() {
        const colors = ['brown', 'grey', 'yellow', 'blue', 'green', 'purple', 'indigo', 'cyan', 'teal', 'amber', 'blue-grey'];
        return colors[hashCode(this.site.name) % colors.length] + ' lighten-5';
    }
}
</script>

<style scoped>
.slim-btn {
    padding: 0 4px !important;
}
</style>