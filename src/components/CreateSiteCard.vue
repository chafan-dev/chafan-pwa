<template>
  <v-card>
    <ValidationObserver v-slot="{ handleSubmit, reset, valid }">
      <v-card-title primary-title>
        <div class="headline primary--text">{{ $t('创建圈子') }}</div>
      </v-card-title>
      <v-card-text>
        <template>
          <v-form>
            <ValidationProvider :name="$t('显示名')" rules="required" v-slot="{ errors }">
              <v-text-field :label="$t('显示名') + '*'" v-model="siteCreate.name" />
              <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider
              :name="$t('Unique sub-domain name')"
              rules="required|subdomain"
              v-slot="{ errors }"
            >
              <v-text-field
                :label="$t('Unique sub-domain name') + '*'"
                v-model="siteCreate.subdomain"
                required
              />
              <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            <v-select
              :label="$t('Permission type') + '*'"
              v-model="siteCreate.permission_type"
              :items="permissionTypeItems"
            />
            <div v-if="siteCreate.permission_type === 'public'">
              {{
                $t(
                  '提示：公开站点一般适合话题型的圈子，内容对所有人可见，注册用户可以参与讨论，但是不能做公共编辑等操作。申请加入可以附加条件。'
                )
              }}
            </div>
            <div v-else-if="siteCreate.permission_type === 'private'">
              {{
                $t(
                  '提示：私有站点一般适合有确定的人群范围的圈子，内容仅对成员可见。申请加入可以附加条件。'
                )
              }}
            </div>
            <v-textarea :label="$t('Description')" n-n v-model="siteCreate.description" />
          </v-form>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn small depressed @click="cancel">{{ $t('Cancel') }}</v-btn>
        <v-btn small depressed @click="resetAll(reset)">{{ $t('Reset') }}</v-btn>
        <v-btn
          small
          depressed
          @click="handleSubmit(submit)"
          color="primary"
          :disabled="intermediate || !valid"
        >
          <template v-if="canCreateSite">
            {{ $t('创建') }}
          </template>
          <template v-else>
            {{ $t('提交申请') }}
          </template>
          <v-progress-circular size="20" color="primary" indeterminate v-if="intermediate" />
        </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ISiteCreate } from '@/interfaces';
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

@Component({
  components: { UserSearch },
})
export default class CreateSite extends Vue {
  private siteCreate: ISiteCreate = {
    name: '',
    subdomain: '',
    permission_type: 'public',
  };

  private readonly permissionTypeItems = ['public', 'private'];

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

  private intermediate = false;
  private async submit() {
    this.intermediate = true;
    if (this.canCreateSite) {
      await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
        action: async () => {
          const site = (await api.createSite(this.$store.state.main.token, this.siteCreate)).data;
          this.$router.push(`/sites/${site.subdomain}`);
        },
        errorFilter: (err: AxiosError) => {
          if (
            err.response &&
            err.response.data.detail ===
              'The site with this subdomain already exists in the system.'
          ) {
            commitAddNotification(this.$store, {
              content: this.$t('圈子域名已存在').toString(),
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
            content: this.$t('因 Karma 不足，已发送申请消息').toString(),
            color: 'info',
          });
          this.$router.push(`/channels/${channelId}`);
        } else {
          commitAddNotification(this.$store, {
            content: this.$t('网站内部错误，请联系管理员').toString(),
            color: 'error',
          });
        }
      });
      this.intermediate = false;
    }
  }
}
</script>
