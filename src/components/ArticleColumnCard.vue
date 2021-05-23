<template>
  <div class="pa-2">
    <v-row justify="center">
      <v-col align-self="center">
        <div
          :class="{
            'mb-6': currentUserId === articleColumn.owner.uuid && !compactMode,
            'mb-2': currentUserId !== articleColumn.owner.uuid && !compactMode,
          }"
        >
          <div v-if="!showColumnEditor">
            <div class="d-flex justify-space-between">
              <router-link
                :to="'/article-columns/' + articleColumn.uuid"
                class="text-decoration-none"
                :class="{ headline: !compactMode, title: compactMode }"
              >
                {{ name }}
              </router-link>
              <div v-if="!showColumnEditor">
                <template v-if="currentUserId === articleColumn.owner.uuid && !compactMode">
                  <v-btn small depressed class="slim-btn mr-2" @click="showColumnEditor = true">
                    编辑专栏
                  </v-btn>
                  <v-btn
                    :to="`/article-editor?articleColumnId=${articleColumn.uuid}`"
                    class="slim-btn"
                    outlined
                    depressed
                    small
                  >
                    写文章
                  </v-btn>
                </template>
                <template v-else-if="currentUserId !== articleColumn.owner.uuid">
                  <v-btn
                    v-if="subscription.subscribed_by_me"
                    :disabled="cancelSubscribeIntermediate"
                    small
                    depressed
                    @click="cancelSubscribe"
                  >
                    {{ $t('取消关注') }} ({{ subscription.subscription_count }})
                    <v-progress-circular
                      v-show="cancelSubscribeIntermediate"
                      :size="20"
                      indeterminate
                    ></v-progress-circular>
                  </v-btn>
                  <v-btn
                    v-else-if="currentUserId !== articleColumn.owner.uuid"
                    :disabled="subscribeIntermediate"
                    color="primary"
                    small
                    depressed
                    @click="subscribe"
                  >
                    {{ $t('关注') }} ({{ subscription.subscription_count }})
                    <v-progress-circular
                      v-show="subscribeIntermediate"
                      :size="20"
                      color="primary"
                      indeterminate
                    ></v-progress-circular>
                  </v-btn>
                </template>
              </div>
            </div>
            <div v-if="desc" class="mt-1">
              {{ desc }}
            </div>
            <div class="mt-1">
              <UserLink :show-avatar="true" :user-preview="articleColumn.owner" />
            </div>
          </div>

          <div v-if="showColumnEditor">
            <v-text-field v-model="name" :label="$t('专栏名称')" />
            <v-textarea v-model="desc" rows="3" :label="$t('专栏描述')" />
            <div class="d-flex">
              <v-spacer />
              <v-btn class="mr-2" color="primary" small @click="updateArticleColumn" depressed
                >{{ $t('提交') }}
              </v-btn>
              <v-btn small depressed @click="cancelUpdateArticleColumn">{{ $t('Cancel') }}</v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { IArticleColumn, IUserArticleColumnSubscription } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import EditIcon from '@/components/icons/EditIcon.vue';
import { readToken, readUserProfile } from '@/store/main/getters';
import BaseCard from '@/components/base/BaseCard.vue';
import UserLink from '@/components/UserLink.vue';

@Component({
  components: { UserLink, BaseCard, EditIcon },
})
export default class ArticleColumnCard extends Vue {
  @Prop() public readonly articleColumn!: IArticleColumn;
  @Prop({ default: false }) public readonly compactMode!: boolean;
  @Prop({ default: false }) public readonly showOwner!: boolean;

  private loading = true;
  private subscription: IUserArticleColumnSubscription | null = null;
  private subscribeIntermediate = false;
  private cancelSubscribeIntermediate = false;
  private showColumnEditor = false;
  private name = '';
  private desc = '';

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get currentUserId() {
    if (!this.userProfile) {
      return undefined;
    }
    return this.userProfile.uuid;
  }

  get token() {
    return readToken(this.$store);
  }

  private async mounted() {
    this.name = this.articleColumn.name;
    this.desc = this.articleColumn.description;
    if (this.currentUserId) {
      await dispatchCaptureApiError(this.$store, async () => {
        this.subscription = (
          await apiArticle.getArticleColumnSubscription(this.token, this.articleColumn.uuid)
        ).data;
      });
    }
    this.loading = false;
  }

  private async subscribe() {
    this.subscribeIntermediate = true;
    if (this.articleColumn !== null) {
      this.subscription = (
        await apiArticle.subscribeArticleColumn(this.token, this.articleColumn.uuid)
      ).data;
      this.subscribeIntermediate = false;
    }
  }

  private async cancelSubscribe() {
    if (this.articleColumn !== null) {
      this.cancelSubscribeIntermediate = true;
      await dispatchCaptureApiError(this.$store, async () => {
        this.subscription = (
          await apiArticle.unsubscribeArticleColumn(this.token, this.articleColumn.uuid)
        ).data;
        this.cancelSubscribeIntermediate = false;
      });
    }
  }

  private async updateArticleColumn() {
    const newArticleColumn = (
      await apiArticle.updateArticleColumn(this.token, this.articleColumn.uuid, {
        name: this.name,
        description: this.desc,
      })
    ).data;
    this.name = newArticleColumn.name;
    this.desc = newArticleColumn.description;
    this.showColumnEditor = false;
  }

  private cancelUpdateArticleColumn() {
    this.showColumnEditor = false;
    this.desc = this.articleColumn.description;
    this.name = this.articleColumn.name;
  }
}
</script>
