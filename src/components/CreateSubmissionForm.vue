<template>
  <v-card variant="outlined">
    <Form v-slot="{ handleSubmit }">
      <v-card-title v-if="showTitle" class="text-primary text-h5"> 分享 </v-card-title>
      <v-card-text>
        <SiteSearch v-if="site === undefined" v-model="selectedSite" label="圈子（默认：大广场）" />
        <v-textarea
          class="mt-4"
          v-model="newSubmissionTitle"
          auto-grow
          density="compact"
          label="标题"
          rows="1"
          hide-details
        />
        <Field v-slot="{ errors }" name="url" rules="url" v-model="newSubmissionURL">
          <v-text-field v-model="newSubmissionURL" label="URL（可选）" :error-messages="errors" clearable />
        </Field>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="postNewSubmissionIntermediate"
          color="primary"
          variant="flat"
          size="small"
          @click="handleSubmit(postNewSubmission)"
        >
          提交
          <v-progress-circular v-if="postNewSubmissionIntermediate" indeterminate size="20" />
        </v-btn>
      </v-card-actions>
    </Form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Form, Field } from 'vee-validate';
import { useRouter } from 'vue-router';
import { apiSubmission } from '@/api/submission';
import { ISite } from '@/interfaces';
import SiteSearch from '@/components/SiteSearch.vue';
import { defaultSiteUuid } from '@/env';
import { AxiosError } from 'axios';
import { useAuth } from '@/composables';
import { useMainStore } from '@/stores/main';
import { useNotificationStore } from '@/stores/notifications';
const store = useMainStore();

const props = withDefaults(defineProps<{
  site?: ISite;
  showTitle?: boolean;
}>(), {
  showTitle: false,
});

const router = useRouter();
const { token } = useAuth();

const newSubmissionTitle = ref('');
const newSubmissionURL = ref<string | null>(null);
const postNewSubmissionIntermediate = ref(false);
const selectedSite = ref<ISite | null>(null);

async function postNewSubmission() {
  if (!token.value) {
    store.showLoginPrompt = true;
    return;
  }
  let siteUUID;
  if (props.site) {
    siteUUID = props.site.uuid;
  } else if (selectedSite.value) {
    siteUUID = selectedSite.value.uuid;
  } else {
    siteUUID = defaultSiteUuid;
  }
  if (newSubmissionTitle.value.length < 5) {
    useNotificationStore().push({
      content: '标题太短了',
      color: 'error',
    });
    return;
  }
  await store.captureApiErrorWithErrorHandler({
    action: async () => {
      postNewSubmissionIntermediate.value = true;
      const response = await apiSubmission.postSubmission(token.value!, {
        site_uuid: siteUUID,
        title: newSubmissionTitle.value,
        url: newSubmissionURL.value ? newSubmissionURL.value : undefined,
      });
      postNewSubmissionIntermediate.value = false;
      if (response) {
        try {
          localStorage.setItem('new-submission', 'true');
        } catch (e) { console.warn('Failed to set new-submission flag in localStorage', e); }
        await router.push(`/submissions/${response.data.uuid}`);
      }
    },
    errorFilter: (err: AxiosError) => {
      postNewSubmissionIntermediate.value = false;
      return false;
    },
  });
}
</script>
