<template>
  <div class="d-flex justify-space-between">
    <v-btn-toggle v-if="reactions" dense multiple background-color="white">
      <v-btn
        v-for="(count, reaction) in reactions.counters"
        :key="reaction"
        class="slim-btn"
        small
        depressed
        :color="reactions.my_reactions.includes(reaction) ? undefined : 'white'"
        @click="
          updateReaction(reaction, reactions.my_reactions.includes(reaction) ? 'cancel' : 'add')
        "
      >
        {{ reaction }}<span class="ml-1" style="color: #121212">{{ count }}</span>
      </v-btn>
    </v-btn-toggle>
    <v-menu v-if="loggedIn" offset-x>
      <template v-slot:activator="{ on, attrs }">
        <ReactionIcon v-bind="attrs" v-on="on" />
      </template>
      <v-list>
        <v-list-item v-for="(reaction, index) in myReactionChoices" :key="index">
          <v-list-item-content
            class="pr-1"
            style="cursor: pointer"
            @click="updateReaction(reaction, 'add')"
          >
            {{ reaction }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-progress-circular
      v-if="reactionIntermediate"
      class="ml-2"
      color="primary"
      indeterminate
      size="20"
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
