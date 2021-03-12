<template>
  <v-card class="pa-2" :class="{ 'c-card': !embedded }" :flat="embedded">
    <v-row justify="center">
      <v-col align-self="center">
        <div
          :class="{
            'mb-6': currentUserId === articleColumn.owner.uuid && !compactMode,
            'mb-2': currentUserId !== articleColumn.owner.uuid && !compactMode,
          }"
        >
          <div class="mb-1" :class="{ headline: !compactMode, 'text-center': !compactMode }">
            <a
              :href="'/article-columns/' + articleColumn.uuid"
              class="text-decoration-none title"
              v-if="!showColumnEditor"
            >
              {{ name }}
            </a>
            <span class="grey--text ml-2" v-if="compactMode && desc && !showColumnEditor">
              {{ desc }}
            </span>
            <v-text-field :label="$t('专栏名称')" v-model="name" v-if="showColumnEditor" />
          </div>
          <div v-if="!compactMode && !showColumnEditor" class="secondary--text text-center">
            <span v-if="desc">{{ desc }}</span>
            <EditIcon
              v-if="currentUserId === articleColumn.owner.uuid"
              @click="showColumnEditor = true"
            />
          </div>
          <v-textarea :label="$t('专栏描述')" v-model="desc" v-if="showColumnEditor" />
          <div class="d-flex" v-if="showColumnEditor">
            <v-spacer />
            <v-btn small @click="updateArticleColumn" class="mr-2" color="primary">{{
              $t('提交')
            }}</v-btn>
            <v-btn small @click="cancelUpdateArticleColumn">{{ $t('Cancel') }}</v-btn>
          </div>
        </div>

        <v-row v-if="subscription && !showColumnEditor">
          <v-col :class="{ 'text-center': !compactMode }">
            <v-btn
              small
              @click="cancelSubscribe"
              v-if="subscription.subscribed_by_me"
              :disabled="cancelSubscribeIntermediate"
            >
              {{ $t('取消关注') }} ({{ subscription.subscription_count }})
              <v-progress-circular
                :size="20"
                indeterminate
                v-show="cancelSubscribeIntermediate"
              ></v-progress-circular>
            </v-btn>
            <v-btn
              small
              @click="subscribe"
              :disabled="subscribeIntermediate"
              color="primary"
              v-else-if="currentUserId !== articleColumn.owner.uuid"
            >
              {{ $t('关注') }} ({{ subscription.subscription_count }})
              <v-progress-circular
                :size="20"
                indeterminate
                color="primary"
                v-show="subscribeIntermediate"
              ></v-progress-circular>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IArticleColumn, IUserArticleColumnSubscription } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiArticle } from '@/api/article';
import EditIcon from '@/components/icons/EditIcon.vue';

@Component({
  components: { EditIcon },
})
export default class ArticleColumnCard extends Vue {
  get currentUserId() {
    if (!this.$store.state.main.userProfile) {
      return undefined;
    }
    return this.$store.state.main.userProfile.uuid;
  }

  @Prop({ default: false }) private readonly embedded!: false;
  @Prop() public readonly articleColumn!: IArticleColumn;
  @Prop({ default: false }) public readonly compactMode!: boolean;

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
      await dispatchCaptureApiError(this.$store, async () => {
        this.subscription = (
          await apiArticle.getArticleColumnSubscription(
            this.$store.state.main.token,
            this.articleColumn.uuid
          )
        ).data;
      });
    }
    this.loading = false;
  }

  get token() {
    return this.$store.state.main.token;
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

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
