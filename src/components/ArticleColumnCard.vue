<template>
  <div class="pa-2">
    <div v-if="!showColumnEditor">
      <div class="d-flex justify-space-between">
        <router-link
          v-if="compactMode"
          :to="'/article-columns/' + articleColumn.uuid"
          class="text-decoration-none title"
        >
          {{ name }}
        </router-link>
        <h2 v-else>
          {{ name }}
        </h2>
        <div v-if="!showColumnEditor" class="d-flex align-center">
          <template v-if="currentUserId === articleColumn.owner.uuid && !compactMode">
            <v-btn class="slim-btn mr-2" depressed small @click="showColumnEditor = true">
              编辑专栏
            </v-btn>
            <v-btn
              :to="`/article-editor?articleColumnId=${articleColumn.uuid}`"
              class="slim-btn"
              depressed
              color="primary"
              small
            >
              写文章
            </v-btn>
          </template>
          <template v-else-if="subscription && currentUserId !== articleColumn.owner.uuid">
            <v-btn
              v-if="subscription.subscribed_by_me"
              :disabled="cancelSubscribeIntermediate"
              depressed
              small
              @click="cancelSubscribe"
            >
              取消关注 ({{ subscription.subscription_count }})
              <v-progress-circular
                v-show="cancelSubscribeIntermediate"
                :size="20"
                indeterminate
              ></v-progress-circular>
            </v-btn>
            <v-btn
              v-else
              :disabled="subscribeIntermediate"
              color="primary"
              depressed
              small
              @click="subscribe"
            >
              关注 ({{ subscription.subscription_count }})
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
      <v-text-field v-model="name" label="专栏名称" />
      <v-textarea v-model="desc" label="专栏描述" rows="3" />
      <div class="d-flex">
        <v-spacer />
        <v-btn class="mr-2" color="primary" depressed small @click="updateArticleColumn"
          >提交
        </v-btn>
        <v-btn depressed small @click="cancelUpdateArticleColumn">取消</v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IArticleColumn, IUserArticleColumnSubscription } from '@/interfaces';
import { Component, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import EditIcon from '@/components/icons/EditIcon.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import UserLink from '@/components/UserLink.vue';
import { CVue } from '@/common';

@Component({
  components: { UserLink, BaseCard, EditIcon },
})
export default class ArticleColumnCard extends CVue {
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

  private async mounted() {
    this.name = this.articleColumn.name;
    this.desc = this.articleColumn.description;
    if (this.currentUserId) {
      if (this.articleColumn.subscription) {
        this.subscription = this.articleColumn.subscription;
      } else {
        await dispatchCaptureApiError(this.$store, async () => {
          this.subscription = (
            await apiArticle.getArticleColumnSubscription(this.token, this.articleColumn.uuid)
          ).data;
        });
      }
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
