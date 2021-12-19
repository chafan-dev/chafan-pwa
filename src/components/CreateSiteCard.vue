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
            <div v-if="siteCreate.permission_type === 'public'" class="text-caption grey--text">
              提示：「公开」类型一般适合话题型的圈子，内容对所有人可见，注册用户可以参与讨论，但是不能做公共编辑等操作。申请加入可以附加条件。
            </div>
            <div
              v-else-if="siteCreate.permission_type === 'private'"
              class="text-caption grey--text"
            >
              提示：「私密」类型一般适合有确定的人群范围的圈子，内容仅对成员可见。申请加入可以附加条件。
            </div>
            <v-textarea v-model="siteCreate.description" hide-details label="描述" />
          </v-form>
          <v-skeleton-loader type="list-item-three-line" v-else />
        </template>
      </v-card-text>
      <v-card-actions>
        <span v-if="!valid" class="text-caption pl-2">提示：表格未填写完</span>
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
import { Component } from 'vue-property-decorator';
import { ISiteCreate, ITopic } from '@/interfaces';
import { api } from '@/api';
import { dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import UserSearch from '@/components/UserSearch.vue';
import { AxiosError } from 'axios';
import { apiSite } from '@/api/site';
import { CVue } from '@/common';

@Component({
  components: { UserSearch },
})
export default class CreateSite extends CVue {
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

  get canCreateSite() {
    if (this.siteCreate.permission_type === 'public') {
      return this.userProfile?.can_create_public_site;
    } else if (this.siteCreate.permission_type === 'private') {
      return this.userProfile?.can_create_private_site;
    }
    return false;
  }

  private async submit() {
    this.intermediate = true;
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        const r = (await apiSite.createSite(this.token, this.siteCreate)).data;
        if (r.created_site) {
          await this.$router.push(`/sites/${r.created_site.subdomain}`);
        } else if (r.application_channel) {
          await this.$router.push(`/channels/${r.application_channel.id}`);
        }
      },
      errorFilter: (err: AxiosError) => {
        return this.commitErrMsg(err) !== null;
      },
    });
    this.intermediate = false;
  }
}
</script>
