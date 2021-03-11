<template>
  <div>
    <v-btn-toggle dense v-if="reactions" multiple>
      <v-btn
        small
        v-for="(count, reaction) in reactions.counters"
        :key="reaction"
        @click="
          updateReaction(reaction, reactions.my_reactions.includes(reaction) ? 'cancel' : 'add')
        "
        :class="{ 'v-btn--active': reactions.my_reactions.includes(reaction) }"
      >
        {{ reaction }} {{ count }}
      </v-btn>
    </v-btn-toggle>
    <v-menu offset-x v-if="loggedIn">
      <template v-slot:activator="{ on, attrs }">
        <ReactionIcon class="ml-2 mr-2" v-on="on" v-bind="attrs" />
      </template>
      <v-list>
        <v-list-item v-for="(reaction, index) in myReactionChoices" :key="index">
          <v-list-item-content
            style="cursor: pointer"
            @click="updateReaction(reaction, 'add')"
            class="pr-1"
          >
            {{ reaction }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-progress-circular
      class="ml-2"
      color="primary"
      indeterminate
      size="20"
      v-if="reactionIntermediate"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import UserLink from '@/components/UserLink.vue';
import ReactionIcon from '@/components/icons/ReactionIcon.vue';
import { IReactions } from '@/interfaces';
import { api2 } from '@/api2';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
  components: { UserLink, ReactionIcon },
})
export default class ReactionBlock extends Vue {
  @Prop() public readonly objectId!: string;
  @Prop() public readonly objectType!: 'question' | 'answer' | 'comment' | 'article';

  private readonly reactionChoices = ['👍', '👎', '👀', '❤️', '😂', '🙏'];
  private myReactionChoices: string[] = [];
  private reactions: IReactions | null = null;
  private reactionIntermediate = false;
  private selectedReactionsIdx = [];

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  private async mounted() {
    this.reactions = (
      await api2.getReactions(this.$store.state.main.token, this.objectId, this.objectType)
    ).data;
    this.updateMyReactionChoices();
  }

  private async updateMyReactionChoices() {
    if (this.reactions) {
      this.myReactionChoices = this.reactionChoices.filter(
        (reaction) => !this.reactions?.my_reactions.includes(reaction)
      );
    }
  }
  private async updateReaction(
    reaction: '👍' | '👎' | '👀' | '❤️' | '😂' | '🙏',
    action: 'add' | 'cancel'
  ) {
    if (!this.loggedIn) {
      return;
    }
    this.reactionIntermediate = true;
    const response = await api2.updateReaction(this.$store.state.main.token, {
      object_uuid: this.objectId,
      object_type: this.objectType,
      reaction,
      action,
    });
    this.reactions = response.data;
    this.updateMyReactionChoices();
    this.reactionIntermediate = false;
  }
}
</script>
