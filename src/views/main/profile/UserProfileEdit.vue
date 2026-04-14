<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-8': isDesktop }">
        <Form v-slot="{ handleSubmit, resetForm }">
          <div v-if="userProfile">
            <v-card-title>
              <div class="text-h5 text-primary">更新个人资料</div>
              <v-spacer></v-spacer>
              <v-btn :to="`/users/${userProfile.handle}`" variant="tonal" size="small">个人资料</v-btn>
            </v-card-title>
            <v-form ref="form">
              <v-row>
                <v-col class="avatar-col">
                  <v-avatar size="150" rounded>
                    <v-progress-circular
                      v-if="uploadAvatarIntermediate"
                      color="primary"
                      indeterminate
                    ></v-progress-circular>
                    <v-img :src="avatarURL" alt="Avatar" @click="showFilePicker" />
                  </v-avatar>
                  <input
                    id="fileInput"
                    accept="image/png, image/jpeg, image/bmp"
                    hidden
                    type="file"
                    @change="uploadAvatar"
                  />
                  <input
                    id="gifFileInput"
                    accept="image/gif"
                    hidden
                    type="file"
                    @change="uploadGifAvatar"
                  />
                  <div class="text-center">
                    <span class="text-caption">点击更改默认头像</span>
                    <v-btn variant="tonal" size="x-small" @click="showGifAvatar = !showGifAvatar">
                      添加额外的 GIF 头像
                    </v-btn>
                  </div>
                  <v-expand-transition>
                    <v-avatar v-show="showGifAvatar" class="mt-2" size="150" rounded>
                      <v-progress-circular
                        v-if="uploadGifAvatarIntermediate"
                        color="primary"
                        indeterminate
                      ></v-progress-circular>
                      <v-img :src="gifAvatarURL" alt="GIF Avatar" @click="showGifFilePicker" />
                    </v-avatar>
                  </v-expand-transition>
                </v-col>
                <v-col>
                  <v-text-field v-model="userUpdateMe.full_name" label="全名或昵称" clearable />
                  <Field v-slot="{ errors }" name="用户名" rules="required" v-model="userUpdateMe.handle">
                    <v-text-field
                      v-model="userUpdateMe.handle"
                      label="用户名（这是你的独有名称，请谨慎更改）"
                      :error-messages="errors"
                    />
                  </Field>
                </v-col>
              </v-row>

              <v-card class="pa-4 my-3" variant="outlined">
                <div class="d-flex my-1">
                  <v-btn
                    class="slim-btn"
                    variant="tonal"
                    size="small"
                    @click="showAboutEditor = !showAboutEditor"
                    >编辑「关于我」
                  </v-btn>
                  <v-spacer />
                  <v-dialog v-model="showClearAboutMe" max-width="400">
                    <v-card>
                      <v-card-title>确认清除「关于我」的内容？</v-card-title>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn color="warning" variant="flat" size="small" @click="clearAboutMe">确认 </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <AppIcon name="Close" v-if="userProfile.about" @click="showClearAboutMe = true"  />
                </div>
                <v-expand-transition>
                  <div v-show="showAboutEditor" class="mt-2">
                    <VditorCF
                      ref="vditor"
                      editor-mode="wysiwyg"
                      :initial-content="userProfile.about"
                      :isMobile="!isDesktop"
                      :onEditorChange="onEditorChange"
                      :vditorUploadConfig="vditorUploadConfig"
                    />
                  </div>
                </v-expand-transition>

                <v-text-field
                  v-model="userUpdateMe.personal_introduction"
                  clearable
                  label="个人签名"
                />
                <ValidateUrl v-model="userUpdateMe.homepage_url">
                  <v-text-field v-model="userUpdateMe.homepage_url" clearable label="个人主页">
                    <template v-slot:prepend>
                      <AppIcon name="Web"  />
                    </template>
                  </v-text-field>
                </ValidateUrl>
                <ValidateUrl v-model="userUpdateMe.zhihu_url">
                  <v-text-field v-model="userUpdateMe.zhihu_url" clearable label="知乎个人页">
                    <template v-slot:prepend>
                      <ZhihuIcon />
                    </template>
                  </v-text-field>
                </ValidateUrl>

                <v-text-field
                  v-model="userUpdateMe.github_username"
                  clearable
                  label="Github 用户名"
                >
                  <template v-slot:prepend>
                    <AppIcon name="Github"  />
                  </template>
                </v-text-field>
                <v-text-field
                  v-model="userUpdateMe.twitter_username"
                  clearable
                  label="Twitter 用户名"
                >
                  <template v-slot:prepend>
                    <AppIcon name="Twitter"  />
                  </template>
                </v-text-field>

                <ValidateUrl v-model="userUpdateMe.linkedin_url">
                  <v-text-field
                    v-model="userUpdateMe.linkedin_url"
                    clearable
                    label="Linkedin 主页地址"
                  >
                    <template v-slot:prepend>
                      <AppIcon name="Linkedin"  />
                    </template>
                  </v-text-field>
                </ValidateUrl>

                <v-combobox
                  v-model="newResidencyTopicNames"
                  :delimiters="[',', '，', '、']"
                  hide-selected
                  label="居住过的地方（按Enter确认添加）"
                  multiple
                  small-chips
                />
                <v-combobox
                  v-model="newProfessionTopicNames"
                  :delimiters="[',', '，', '、']"
                  hide-selected
                  label="所在行业（按Enter确认添加）"
                  multiple
                  small-chips
                />
              </v-card>
              <EducationExperienceSection
                v-model="eduExps"
                :years="years"
                @request-remove="(index) => removeFromConfirm(index, eduExps)"
              />

              <WorkExperienceSection
                v-model="workExps"
                @request-remove="(index) => removeFrom(index, workExps)"
              />

              <v-dialog v-model="showRemoveConfirm" max-width="600">
                <v-card>
                  <v-card-title>从草稿中删除？</v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn size="small" variant="tonal" @click="showRemoveConfirm = false">取消</v-btn>
                    <v-btn size="small" variant="flat" color="warning" @click="removeCallback">确认</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-form>
            <v-card-actions class="px-4">
              <v-spacer></v-spacer>
              <v-btn variant="tonal" smal @click="cancel">取消</v-btn>
              <v-btn variant="tonal" smal @click="resetAll(resetForm)">重置</v-btn>
              <v-btn
                :disabled="!meta.valid || submitIntermediate"
                color="primary"
                variant="flat"
                smal
                @click="handleSubmit(submit)"
              >
                保存
              </v-btn>
            </v-card-actions>
          </div>
        </Form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Form, Field } from 'vee-validate';
import { useRouter } from 'vue-router';
import { api2 } from '@/api2';
import { apiPeople } from '@/api/people';
import { editor_T, ITopic, IUserUpdateMe } from '@/interfaces';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { deepCopy, getRecentYears } from '@/utils';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';
import { api } from '@/api';
import VditorCF from '@/editors/lib-components/VditorCF.vue';
import { getVditorUploadConfig } from '@/common';
import ValidateUrl from '@/components/base/ValidateUrl.vue';
import ZhihuIcon from '@/components/icons/ZhihuIcon.vue';
import EducationExperienceSection from '@/components/profile/EducationExperienceSection.vue';
import WorkExperienceSection from '@/components/profile/WorkExperienceSection.vue';
import { useAuth, useResponsive } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();

interface IUserWorkExperienceItem {
  company_topic_name?: string;
  position_topic_name?: string;
  major?: string;
  enroll_year?: string;
  graduate_year?: string;
}

interface IUserEducationExperienceItem {
  school_topic_name?: string;
  level_name?: string;
  major?: string;
  enroll_year?: string;
  graduate_year?: string;
}

const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();

const newResidencyTopicNames = ref<string[]>([]);
const newProfessionTopicNames = ref<string[]>([]);
const userUpdateMe = reactive<IUserUpdateMe>({
  full_name: '',
  handle: '',
  personal_introduction: '',
});
const newWorkExpCompanyName = ref('');
const newWorkExpPositionName = ref('');
const eduExps = ref<IUserEducationExperienceItem[]>([]);
const workExps = ref<IUserWorkExperienceItem[]>([]);
const submitIntermediate = ref(false);
const avatarURL = ref('#');
const uploadAvatarIntermediate = ref(false);
const uploadGifAvatarIntermediate = ref(false);
const gifAvatarURL = ref<string | null>(null);
const showGifAvatar = ref(false);
const aboutEditor = ref<editor_T>('wysiwyg');
const showAboutEditor = ref(false);
const showClearAboutMe = ref(false);
const categoryTopics = ref<ITopic[] | null>(null);
const years = ref<string[]>([]);
const vditor = ref<InstanceType<typeof VditorCF> | null>(null);

const showRemoveConfirm = ref(false);
const removeCallback = ref<(() => void) | null>(null);

const vditorUploadConfig = computed(() => {
  return getVditorUploadConfig(store.token);
});

onMounted(async () => {
  years.value = getRecentYears();
  categoryTopics.value = (await api.getCategoryTopics()).data;
  const profile = userProfile.value;
  if (!profile) {
    return;
  }
  if (profile.avatar_url) {
    avatarURL.value = profile.avatar_url;
  } else {
    avatarURL.value = '/img/default-avatar.png';
  }
  if (profile.gif_avatar_url) {
    gifAvatarURL.value = profile.gif_avatar_url;
    showGifAvatar.value = true;
  }
  Object.keys(userUpdateMe).forEach((key) => {
    userUpdateMe[key] = profile[key];
  });
  userUpdateMe.residency_topic_uuids = profile.residency_topics.map((t) => t.uuid);
  newResidencyTopicNames.value = profile.residency_topics.map((t) => t.name);
  if (profile.profession_topics) {
    userUpdateMe.profession_topic_uuids = profile.profession_topics.map((t) => t.uuid);
    newProfessionTopicNames.value = profile.profession_topics.map((t) => t.name);
  } else {
    userUpdateMe.profession_topic_uuids = [];
    newProfessionTopicNames.value = [];
  }

  userUpdateMe.homepage_url = profile.homepage_url;
  userUpdateMe.zhihu_url = profile.zhihu_url;
  userUpdateMe.github_username = profile.github_username;
  userUpdateMe.twitter_username = profile.twitter_username;
  userUpdateMe.linkedin_url = profile.linkedin_url;

  await store.captureApiError(async () => {
    const response = await apiPeople.getUserEducationExperiences(token.value, profile.uuid);
    if (response.data) {
      eduExps.value = response.data.map((e) => {
        return {
          school_topic_name: e.school_topic.name,
          level_name: e.level,
          major: e.major,
          enroll_year: e.enroll_year,
          graduate_year: e.graduate_year,
        };
      });
    }
    const response2 = await apiPeople.getUserWorkExperiences(token.value, profile.uuid);
    if (response2.data) {
      workExps.value = response2.data.map((e) => {
        return {
          company_topic_name: e.company_topic.name,
          position_topic_name: e.position_topic.name,
        };
      });
    }
  });
});

function resetAll(resetForm?: () => void) {
  const profile = store.userProfile;
  if (profile) {
    newResidencyTopicNames.value = profile.residency_topics.map((topic) => topic.name);
    newProfessionTopicNames.value = profile.profession_topics.map((topic) => topic.name);
    Object.keys(userUpdateMe).forEach((key) => {
      userUpdateMe[key] = profile[key];
    });
  }
  resetForm?.();
}

function cancel() {
  router.back();
}

async function submit() {
  submitIntermediate.value = true;
  await store.captureApiError(async () => {
    const responses = await Promise.all(
      newResidencyTopicNames.value.map((name) => apiTopic.createTopic(token.value, { name }))
    );
    userUpdateMe.residency_topic_uuids = responses.map((r) => r.data.uuid);

    const responses2 = await Promise.all(
      newProfessionTopicNames.value.map((name) => apiTopic.createTopic(token.value, { name }))
    );
    userUpdateMe.profession_topic_uuids = responses2.map((r) => r.data.uuid);

    const workExpsData = await Promise.all(
      workExps.value.map(async (e) => {
        if (e.company_topic_name && e.position_topic_name) {
          const r1 = await apiTopic.createTopic(token.value, {
            name: e.company_topic_name,
          });
          const r2 = await apiTopic.createTopic(token.value, {
            name: e.position_topic_name,
          });
          return {
            company_topic_uuid: r1.data.uuid,
            position_topic_uuid: r2.data.uuid,
          };
        } else {
          return null;
        }
      })
    );

    userUpdateMe.work_experiences = [];
    for (const e of workExpsData) {
      if (e !== null) {
        userUpdateMe.work_experiences.push(e);
      }
    }

    const eduExpsData = await Promise.all(
      eduExps.value.map(async (e) => {
        if (e.school_topic_name && e.level_name) {
          const r1 = await apiTopic.createTopic(token.value, {
            name: e.school_topic_name,
          });
          return {
            school_topic_uuid: r1.data.uuid,
            level_name: e.level_name,
            major: e.major,
            enroll_year: e.enroll_year,
            graduate_year: e.graduate_year,
          };
        } else {
          return null;
        }
      })
    );

    userUpdateMe.education_experiences = [];
    for (const e of eduExpsData) {
      if (e !== null) {
        userUpdateMe.education_experiences.push(e);
      }
    }

    const response = await apiMe.updateMe(token.value, userUpdateMe);
    if (response) {
      store.userProfile = response.data;
      store.notifications.push({
        content: '更新成功',
        color: 'success',
      });
      await router.push({
        name: 'user',
        params: { handle: response.data.handle },
        query: { details: 'true' },
      });
    }
    submitIntermediate.value = false;
  });
}

function addNewWorkExp() {
  if (!newWorkExpCompanyName.value || !newWorkExpPositionName.value) {
    store.notifications.push({
      content: '公司名和职位均为必填',
      color: 'error',
    });
    return;
  }
  workExps.value.push({
    company_topic_name: newWorkExpCompanyName.value,
    position_topic_name: newWorkExpPositionName.value,
  });
  newWorkExpCompanyName.value = '';
  newWorkExpPositionName.value = '';
}

function removeFrom<T>(index: number, arr: T[]) {
  arr.splice(index, 1);
}

async function uploadAvatar() {
  uploadAvatarIntermediate.value = true;
  await store.captureApiError(async () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    if (fileInput !== null) {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size <= 128) {
          store.notifications.push({
            content: '头像文件过小',
            color: 'error',
          });
          uploadAvatarIntermediate.value = false;
          return;
        }
        const formData = new FormData();
        const resized = await resizeImage({
          maxSize: 500, // px
          file,
        });

        // Upload candidate image and update URL
        try {
          formData.append('file', piexif.remove(resized.blob));
          // Remove EXIF if it is jpeg
        } catch {
          formData.append('file', resized.blob);
        }
        avatarURL.value = resized.dataUrl;
        const response = await api2.uploadFile(token.value, formData);
        userUpdateMe.avatar_url = response.data.url;
      }
    }
    uploadAvatarIntermediate.value = false;
  });
}

async function uploadGifAvatar() {
  uploadGifAvatarIntermediate.value = true;
  await store.captureApiError(async () => {
    const fileInput = document.getElementById('gifFileInput') as HTMLInputElement;
    if (fileInput !== null) {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size <= 128) {
          store.notifications.push({
            content: '头像文件过小',
            color: 'error',
          });
          uploadGifAvatarIntermediate.value = false;
          return;
        }
        const formData = new FormData();

        formData.append('file', file);

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          gifAvatarURL.value = fileReader.result as string;
        };
        const response = await api2.uploadFile(token.value, formData);
        userUpdateMe.gif_avatar_url = response.data.url;
      }
    }
    uploadGifAvatarIntermediate.value = false;
  });
}

function showFilePicker() {
  document.getElementById('fileInput')?.click();
}

function showGifFilePicker() {
  showGifAvatar.value = true;
  document.getElementById('gifFileInput')?.click();
}

function onEditorChange() {
  userUpdateMe.about = vditor.value?.getContent() || undefined;
}

function clearAboutMe() {
  vditor.value?.init(aboutEditor.value, '');
  showAboutEditor.value = false;
  showClearAboutMe.value = false;
  userUpdateMe.about = null;
}

function removeFromConfirm<T>(index: number, arr: T[]) {
  showRemoveConfirm.value = true;
  removeCallback.value = () => {
    removeFrom(index, arr);
    showRemoveConfirm.value = false;
  };
}
</script>
