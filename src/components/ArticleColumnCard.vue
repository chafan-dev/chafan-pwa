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
          <div :class="{ headline: !compactMode, 'text-center': !compactMode }" class="mb-1">
            <router-link
              v-if="!showColumnEditor"
              :to="'/article-columns/' + articleColumn.uuid"
              class="text-decoration-none title"
            >
              {{ name }}
            </router-link>
            <span v-if="compactMode && desc && !showColumnEditor" class="grey--text ml-2">
              {{ desc }}
            </span>
            <v-text-field v-if="showColumnEditor" v-model="name" :label="$t('专栏名称')" />
          </div>
          <div v-if="!compactMode && !showColumnEditor" class="secondary--text text-center">
            <span v-if="desc">{{ desc }}</span>
            <v-btn
              small
              depressed
              v-if="currentUserId === articleColumn.owner.uuid"
              @click="showColumnEditor = true"
            >
              <EditIcon /> 编辑专栏描述
            </v-btn>
          </div>
          <v-textarea v-if="showColumnEditor" v-model="desc" :label="$t('专栏描述')" />
          <div v-if="showColumnEditor" class="d-flex">
            <v-spacer />
            <v-btn class="mr-2" color="primary" small @click="updateArticleColumn" depressed
              >{{ $t('提交') }}
            </v-btn>
            <v-btn small depressed @click="cancelUpdateArticleColumn">{{ $t('Cancel') }}</v-btn>
          </div>
        </div>

        <v-row v-if="subscription && !showColumnEditor">
          <v-col :class="{ 'text-center': !compactMode }">
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
          </v-col>
        </v-row>
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

@Component({
  components: { BaseCard, EditIcon },
})
export default class ArticleColumnCard extends Vue {
  @Prop() public readonly articleColumn!: IArticleColumn;
  @Prop({ default: false }) public readonly compactMode!: boolean;
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
