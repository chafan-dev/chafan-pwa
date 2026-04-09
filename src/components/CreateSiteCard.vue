<template>
  <v-card>
    <Form v-slot="{ handleSubmit, resetForm, meta }">
      <v-card-title>
        <div class="text-h5 text-primary">创建圈子</div>
      </v-card-title>
      <v-card-text>
          <v-form v-if="categoryTopics !== null">
            <Field v-slot="{ errors }" name="显示名" rules="required" v-model="siteCreate.name">
              <v-text-field v-model="siteCreate.name" label="显示名*" :error-messages="errors" />
            </Field>
            <Field v-slot="{ errors }" name="唯一域名" rules="required|id" v-model="siteCreate.subdomain">
              <v-text-field v-model="siteCreate.subdomain" label="唯一域名*" required :error-messages="errors" />
            </Field>
            <v-select
              v-model="siteCreate.permission_type"
              :items="permissionTypeItems"
              item-text="text"
              item-value="value"
              label="圈子类型*"
            />
            <div v-if="siteCreate.permission_type === 'public'" class="text-caption text-grey">
              提示：内容对所有人可见
            </div>
            <div
              v-else-if="siteCreate.permission_type === 'private'"
              class="text-caption text-grey"
            >
              提示：Deprecated
            </div>

                <!-- TODO add rule to set it -->
            <v-textarea v-model="siteCreate.description" hide-details label="描述*" />
          </v-form>
          <v-skeleton-loader type="list-item-three-line" v-else />
      </v-card-text>
      <v-card-actions>
        <span v-if="!meta.valid" class="text-caption pl-2">提示：表格未填写完</span>
        <v-spacer />
        <v-btn variant="tonal" size="small" @click="cancel">取消</v-btn>
        <v-btn variant="tonal" size="small" @click="resetAll(resetForm)">重置</v-btn>
        <v-btn
          :disabled="intermediate || !meta.valid"
          color="primary"
          variant="flat"
          size="small"
          @click="handleSubmit(submit)"
        >
          <template v-if="canCreateSite"> 创建</template>
          <template v-else> 提交申请</template>
          <v-progress-circular v-if="intermediate" color="primary" indeterminate size="20" />
        </v-btn>
      </v-card-actions>
    </Form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Form, Field } from 'vee-validate';
import { useRouter } from 'vue-router';
import { ISiteCreate, ITopic } from '@/interfaces';
import { api } from '@/api';
import { AxiosError } from 'axios';
import { apiSite } from '@/api/site';
import { useAuth, useErrorHandling } from '@/composables';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const router = useRouter();
const { token, userProfile } = useAuth();
const { commitErrMsg } = useErrorHandling();

const siteCreate = reactive<ISiteCreate>({
  name: '',
  subdomain: '',
  permission_type: 'public',
});

const permissionTypeItems = [
  { text: '公开', value: 'public' },
  { text: '私密', value: 'private' },
];

const intermediate = ref(false);
const categoryTopics = ref<ITopic[] | null>(null);

onMounted(async () => {
  categoryTopics.value = (await api.getCategoryTopics()).data;
});

function resetAll(resetForm?: () => void) {
  siteCreate.name = '';
  siteCreate.subdomain = '';
  siteCreate.permission_type = 'public';
  if (resetForm) {
    resetForm();
  }
}

function cancel() {
  router.back();
}

const canCreateSite = computed(() => {
  if (siteCreate.permission_type === 'public') {
    return userProfile.value?.can_create_public_site;
  } else if (siteCreate.permission_type === 'private') {
    return userProfile.value?.can_create_private_site;
  }
  return false;
});

async function submit() {
  intermediate.value = true;
  await store.captureApiErrorWithErrorHandler({
    action: async () => {
      const r = (await apiSite.createSite(token.value, siteCreate)).data;
      if (r.created_site) {
        await router.push(`/sites/${r.created_site.subdomain}`);
      } else if (r.application_channel) {
        await router.push(`/channels/${r.application_channel.id}`);
      }
    },
    errorFilter: (err: AxiosError) => {
      return commitErrMsg(err) !== null;
    },
  });
  intermediate.value = false;
}
</script>
