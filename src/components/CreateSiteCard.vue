<template>
  <v-card>
    <ValidationObserver v-slot="{ handleSubmit, reset, valid }">
      <v-card-title primary-title>
        <div class="headline primary--text">创建圈子</div>
      </v-card-title>
      <v-card-text>
        <template>
          <v-form v-if="categoryTopics !== null">
            <ValidationProvider v-slot="{ errors }" name="显示名" rules="required">
              <v-text-field v-model="siteCreate.name" label="显示名*" />
              <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" name="唯一域名" rules="required|subdomain">
              <v-text-field v-model="siteCreate.subdomain" label="唯一域名*" required />
              <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            <v-select
              v-model="siteCreate.category_topic_uuid"
              :items="categoryTopics"
              item-text="name"
              item-value="uuid"
              label="类别*"
            />
            <v-select
              v-model="siteCreate.permission_type"
              :items="permissionTypeItems"
              item-text="text"
              item-value="value"
              label="圈子类型*"
            />
            <div v-if="siteCreate.permission_type === 'public'">
              提示：「公开」类型一般适合话题型的圈子，内容对所有人可见，注册用户可以参与讨论，但是不能做公共编辑等操作。申请加入可以附加条件。
            </div>
            <div v-else-if="siteCreate.permission_type === 'private'">
              提示：「私密」类型一般适合有确定的人群范围的圈子，内容仅对成员可见。申请加入可以附加条件。
            </div>
            <v-textarea v-model="siteCreate.description" hide-details label="描述" />
          </v-form>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn depressed small @click="cancel">取消</v-btn>
        <v-btn depressed small @click="resetAll(reset)">重置</v-btn>
        <v-btn
          :disabled="intermediate || !valid"
          color="primary"
          depressed
          small
          @click="handleSubmit(submit)"
        >
          <template v-if="canCreateSite"> 创建</template>
          <template v-else> 提交申请</template>
          <v-progress-circular v-if="intermediate" color="primary" indeterminate size="20" />
        </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ISiteCreate, ITopic } from '@/interfaces';
import { api } from '@/api';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';
import UserSearch from '@/components/UserSearch.vue';
import { AxiosError } from 'axios';
import { commitAddNotification } from '@/store/main/mutations';
import { readUserProfile } from '@/store/main/getters';
import { adminUUID, env } from '@/env';
import { apiSite } from '@/api/site';

@Component({
  components: { UserSearch },
})
export default class CreateSite extends Vue {
  private siteCreate: ISiteCreate = {
    name: '',
    subdomain: '',
    permission_type: 'public',
  };

  private readonly permissionTypeItems = [
    {
      text: '公开',
      value: 'public',
    },
    {
      text: '私密',
      value: 'private',
    },
  ];
  private intermediate = false;
  private categoryTopics: ITopic[] | null = null;

  get canCreateSite() {
    if (env !== 'production') {
      return true;
    }
    const userProfile = readUserProfile(this.$store);
    if (userProfile && userProfile.karma >= 1000 && this.siteCreate.permission_type === 'public') {
      return true;
    }
    if (userProfile && userProfile.karma >= 200 && this.siteCreate.permission_type === 'private') {
      return true;
    }
    return false;
  }

  private async mounted() {
    this.categoryTopics = (await api.getCategoryTopics()).data;
  }

  private resetAll(reset) {
    this.siteCreate = {
      name: '',
      subdomain: '',
      permission_type: 'public',
    };
    if (reset) {
      reset();
    }
  }

  private cancel() {
    this.$router.back();
  }

  private async submit() {
    this.intermediate = true;
    if (this.canCreateSite) {
      await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
        action: async () => {
          const site = (await apiSite.createSite(this.$store.state.main.token, this.siteCreate))
            .data;
          await this.$router.push(`/sites/${site.subdomain}`);
        },
        errorFilter: (err: AxiosError) => {
          if (
            err.response &&
            err.response.data.detail ===
              'The site with this subdomain already exists in the system.'
          ) {
            commitAddNotification(this.$store, {
              content: '圈子域名已存在',
              color: 'error',
            });
            return true;
          }
          return false;
        },
      });
      this.intermediate = false;
    } else {
      const siteCreateInfo = JSON.stringify(this.siteCreate);
      await dispatchCaptureApiError(this.$store, async () => {
        if (adminUUID) {
          const r0 = await api.createChannel(this.$store.state.main.token, {
            private_with_user_uuid: adminUUID,
          });
          const channelId = r0.data.id;
          await api.createMessage(this.$store.state.main.token, {
            channel_id: channelId,
            body: '申请创建圈子：\n' + siteCreateInfo,
          });
          commitAddNotification(this.$store, {
            content: '因 Karma 不足，已发送申请消息',
            color: 'info',
          });
          this.$router.push(`/channels/${channelId}`);
        } else {
          commitAddNotification(this.$store, {
            content: '网站内部错误，请联系管理员',
            color: 'error',
          });
        }
      });
      this.intermediate = false;
    }
  }
}
</script>
