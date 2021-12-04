<template>
  <div class="d-flex">
    <v-btn-toggle v-if="reactions" background-color="white" class="mr-1" dense multiple>
      <v-btn
        v-for="(count, reaction) in reactions.counters"
        :key="reaction"
        :color="reactions.my_reactions.includes(reaction) ? undefined : 'white'"
        class="slim-btn"
        depressed
        small
        @click="
          updateReaction(reaction, reactions.my_reactions.includes(reaction) ? 'cancel' : 'add')
        "
      >
        {{ reaction }}<span class="ml-1" style="color: #121212">{{ count }}</span>
      </v-btn>
    </v-btn-toggle>
    <span>
      <v-menu v-if="loggedIn" offset-x>
        <template v-slot:activator="{ on, attrs }">
          <ReactionIcon v-bind="attrs" v-on="on" />
        </template>
        <v-list>
          <v-list-item
            v-for="(reaction, index) in myReactionChoices"
            :key="index"
            @click="updateReaction(reaction, 'add')"
          >
            <v-list-item-content class="pr-1" style="cursor: pointer">
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
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import UserLink from '@/components/UserLink.vue';
import ReactionIcon from '@/components/icons/ReactionIcon.vue';
import { IReactions } from '@/interfaces';
import { api2 } from '@/api2';
import { CVue } from '@/common';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';

@Component({
  components: { UserLink, ReactionIcon },
})
export default class ReactionBlock extends CVue {
  @Prop() public readonly objectId!: string;
  @Prop() public readonly objectType!: 'question' | 'answer' | 'comment' | 'article';

  private readonly reactionChoices = ['👍', '👎', '👀', '❤️', '😂', '🙏'];
  private myReactionChoices: string[] = [];
  private reactions: IReactions | null = null;
  private reactionIntermediate = false;

  private async mounted() {
    this.reactions = (await api2.getReactions(this.token, this.objectId, this.objectType)).data;
    await this.updateMyReactionChoices();
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
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.reactionIntermediate = true;
    const response = await api2.updateReaction(this.token, {
      object_uuid: this.objectId,
      object_type: this.objectType,
      reaction,
      action,
    });
    this.reactions = response.data;
    await this.updateMyReactionChoices();
    this.reactionIntermediate = false;
  }
}
</script>
