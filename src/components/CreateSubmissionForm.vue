<template>
  <v-card outlined>
    <ValidationObserver v-slot="{ handleSubmit }">
      <v-card-title v-if="showTitle" class="primary--text headline"> 分享 </v-card-title>
      <v-card-text>
        <SiteSearch v-if="site === undefined" v-model="selectedSite" label="圈子（默认：大广场）" />
        <v-textarea
          class="mt-4"
          v-model="newSubmissionTitle"
          auto-grow
          dense
          label="标题"
          rows="1"
          hide-details
        />
        <ValidationProvider v-slot="{ errors }" name="URL" rules="url">
          <v-text-field v-model="newSubmissionURL" label="URL（可选）" hide-details clearable />
          <span class="error--text">{{ errors[0] }}</span>
        </ValidationProvider>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="postNewSubmissionIntermediate"
          color="primary"
          depressed
          small
          @click="handleSubmit(postNewSubmission)"
        >
          提交
          <v-progress-circular v-if="postNewSubmissionIntermediate" indeterminate size="20" />
        </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router/composables';
import { apiSubmission } from '@/api/submission';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { ISite } from '@/interfaces';
import { dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import SiteSearch from '@/components/SiteSearch.vue';
import { defaultSiteUuid } from '@/env';
import { AxiosError } from 'axios';
import { useAuth } from '@/composables';
import store from '@/store';

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
    commitSetShowLoginPrompt(store, true);
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
    commitAddNotification(store, {
      content: '标题太短了',
      color: 'error',
    });
    return;
  }
  await dispatchCaptureApiErrorWithErrorHandler(store, {
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
        } catch (e) {}
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
