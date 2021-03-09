<template>
  <v-card>
    <ValidationObserver v-slot="{ handleSubmit, reset }">
    <v-card-title primary-title>
      <div class="headline primary--text">{{$t('创建圈子')}}</div>
    </v-card-title>
    <v-card-text>
      <template>
        <v-form>
          <ValidationProvider :name="$t('显示名')" rules="required" v-slot="{ errors }">
            <v-text-field :label="$t('显示名')" v-model="siteCreate.name" />
            <span class="error--text">{{ errors[0] }}</span>
          </ValidationProvider>
          <ValidationProvider :name="$t('Unique sub-domain name')" rules="required|subdomain" v-slot="{ errors }">
            <v-text-field :label="$t('Unique sub-domain name')" v-model="siteCreate.subdomain" required />
            <span class="error--text">{{ errors[0] }}</span>
          </ValidationProvider>
          <v-select :label="$t('Permission type')" v-model="siteCreate.permission_type"
                    :items="permissionTypeItems" />
          <v-textarea :label="$t('Description')" v-model="siteCreate.description" />
        </v-form>
      </template>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn small depressed @click="cancel">{{$t('Cancel')}}</v-btn>
      <v-btn small depressed @click="resetAll(reset)">{{$t('Reset')}}</v-btn>
      <v-btn small depressed @click="handleSubmit(submit)" color="primary" :disabled="intermediate">
        {{$t('提交')}}
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
import { dispatchCaptureApiError, dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import UserSearch from '@/components/UserSearch.vue';
import { AxiosError } from 'axios';
import { commitAddNotification } from '@/store/main/mutations';
import { readUserProfile } from '@/store/main/getters';
import { adminUUID } from '@/env';

@Component({
  components: { UserSearch },
})
export default class CreateSite extends Vue {
  private valid = false;
  private siteCreate: ISiteCreate = {
    name: '',
    subdomain: '',
  };
  private myToken: string | null = null;
  private readonly permissionTypeItems = ['public', 'private'];

  get canCreateSite() {
        const userProfile = readUserProfile(this.$store);
        if (userProfile && userProfile.karma > 1000) {
            return true;
        }
        return false;
    }

  private resetAll(reset) {
    this.siteCreate = {
      name: '',
      subdomain: '',
    };
    if (reset) { reset(); }
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
          if (err.response && err.response.data.detail === 'The site with this subdomain already exists in the system.') {
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
          console.log(adminUUID);
          const r0 = await api.createChannel(this.$store.state.main.token, {
              private_with_user_uuid: adminUUID,
          });
          const channelId = r0.data.id;
          await api.createMessage(this.$store.state.main.token, {
            channel_id: channelId,
            body: "申请创建圈子：\n" + siteCreateInfo
          });
          commitAddNotification(this.$store, {
              content: this.$t('因 Karma 不足，已发送申请消息').toString(),
              color: 'info',
          });
          this.$router.push(`/channels/${channelId}`);
      });
      this.intermediate = false;
    }
  }

  private mounted() {
    this.myToken = this.$store.state.main.token;
  }
}
</script>
