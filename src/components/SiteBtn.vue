<template>
  <v-menu :open-on-hover="!$vuetify.breakpoint.mobile" offset-y open-delay="400" right top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        :color="color"
        :to="'/sites/' + site.subdomain"
        class="mr-1 mt-1"
        depressed
        small
      >
        {{ site.name }}
        <PrivateSiteIcon v-if="site.permission_type === 'private'" class="ml-1" />
        <span v-if="showHotness" class="ml-1">({{ hotness }})</span>
      </v-btn>
    </template>
    <v-lazy>
      <v-card max-width="400">
        <SiteCard
          :compactMode="true"
          :showQuestionEditor="false"
          :showSubmissionEditor="false"
          :site="site"
          class="px-3 py-2"
        />
      </v-card>
    </v-lazy>
  </v-menu>
</template>

<script lang="ts">
import { ISite } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import PrivateSiteIcon from '@/components/icons/PrivateSiteIcon.vue';
import SiteCard from '@/components/SiteCard.vue';

function hashCode(str) {
  let hash = 0,
    i,
    chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

@Component({
  components: { PrivateSiteIcon, SiteCard },
})
export default class SiteBtn extends Vue {
  @Prop() public readonly site!: ISite;
  @Prop({ default: false }) public readonly showHotness!: boolean;

  get hotness() {
    return Math.floor(
      Math.log2(
        this.site.questions_count +
          this.site.members_count / 10 +
          this.site.submissions_count / 2 +
          1
      )
    );
  }

  get color() {
    const colors = [
      'brown',
      'grey',
      'yellow',
      'blue',
      'green',
      'purple',
      'indigo',
      'cyan',
      'teal',
      'amber',
      'blue-grey',
    ];
    return colors[hashCode(this.site.name) % colors.length] + ' lighten-5';
  }
}
</script>
