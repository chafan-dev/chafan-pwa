<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-8': isDesktop }">
        <ValidationObserver v-slot="{ handleSubmit, reset }">
          <div v-if="userProfile">
            <v-card-title primary-title>
              <div class="headline primary--text">更新个人资料</div>
              <v-spacer></v-spacer>
              <v-btn :to="`/users/${userProfile.handle}`" depressed small>个人资料</v-btn>
            </v-card-title>
            <v-form ref="form" v-model="valid" lazy-validation>
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
                    <v-btn depressed x-small @click="showGifAvatar = !showGifAvatar">
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
                  <ValidationProvider v-slot="{ errors }" name="用户名" rules="required">
                    <v-text-field
                      v-model="userUpdateMe.handle"
                      label="用户名（这是你的独有名称，请谨慎更改）"
                    />
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <v-card class="pa-4 my-3" outlined>
                <div class="d-flex my-1">
                  <v-btn
                    class="slim-btn"
                    depressed
                    small
                    @click="showAboutEditor = !showAboutEditor"
                    >编辑「关于我」
                  </v-btn>
                  <v-spacer />
                  <v-dialog v-model="showClearAboutMe" max-width="400">
                    <v-card>
                      <v-card-title>确认清除「关于我」的内容？</v-card-title>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn color="warning" depressed small @click="clearAboutMe">确认 </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <CloseIcon v-if="userProfile.about" @click="showClearAboutMe = true" />
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
                <ValidateUrl>
                  <v-text-field v-model="userUpdateMe.homepage_url" clearable label="个人主页">
                    <template v-slot:prepend>
                      <WebIcon />
                    </template>
                  </v-text-field>
                </ValidateUrl>
                <ValidateUrl>
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
                    <GithubIcon />
                  </template>
                </v-text-field>
                <v-text-field
                  v-model="userUpdateMe.twitter_username"
                  clearable
                  label="Twitter 用户名"
                >
                  <template v-slot:prepend>
                    <TwitterIcon />
                  </template>
                </v-text-field>

                <ValidateUrl>
                  <v-text-field
                    v-model="userUpdateMe.linkedin_url"
                    clearable
                    label="Linkedin 主页地址"
                  >
                    <template v-slot:prepend>
                      <LinkedinIcon />
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
              <v-card class="pa-4 my-3" outlined>
                <div class="title mb-4 d-flex">
                  教育经历
                  <v-spacer />
                  <v-btn color="primary" depressed small @click="showAddNewEduExpDialog">
                    添加
                  </v-btn>
                </div>
                <template v-for="(exp, index) in eduExps">
                  <v-divider :key="'edu-divider' + index" v-if="index > 0" class="py-1" />
                  <div :key="'edu-' + index" class="py-1 d-flex justify-space-between">
                    <EduExp
                      :school-name="exp.school_topic_name"
                      :level-name="exp.level_name"
                      :enroll-year="exp.enroll_year"
                      :graduate-year="exp.graduate_year"
                      :major="exp.major"
                    />
                    <div>
                      <EditIcon class="pl-1" @click="showEduExpEditor(index)" />
                      <UpIcon class="pl-1" @click="moveUpFrom(index, eduExps)" />
                      <DownIcon class="pl-1" @click="moveDownFrom(index, eduExps)" />
                      <DeleteIcon class="pl-1" @click="removeFromConfirm(index, eduExps)" />
                    </div>
                  </div>
                </template>
                <v-dialog v-model="eduExpEditorShown" max-width="600">
                  <v-card>
                    <v-card-title>编辑教育经历</v-card-title>
                    <v-card-text v-if="editedEduExp">
                      <v-text-field v-model="editedEduExp.school_topic_name" label="学校名" />
                      <v-combobox
                        v-model="editedEduExp.level_name"
                        :items="eduExpLeveNames"
                        label="教育水平"
                      />
                      <v-text-field
                        v-model="editedEduExp.major"
                        label="专业/方向（选填）"
                        clearable
                      />
                      <div class="d-flex">
                        <v-autocomplete
                          class="mr-2"
                          :items="years"
                          v-model="editedEduExp.enroll_year"
                          label="入学年份（选填）"
                          clearable
                        />
                        <v-autocomplete
                          :items="['在读'].concat(years)"
                          v-model="editedEduExp.graduate_year"
                          label="毕业年份（选填）"
                          clearable
                        />
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn small depressed @click="eduExpEditorShown = false">取消</v-btn>
                      <v-btn small depressed color="primary" @click="saveEduExpEditDraft"
                        >保存草稿</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card>

              <v-card class="pa-4 my-3" outlined>
                <div class="title mb-4 d-flex">
                  工作经历
                  <v-spacer />
                  <v-btn color="primary" depressed small @click="showAddNewWorkExpDialog">
                    添加
                  </v-btn>
                </div>
                <template v-for="(exp, index) in workExps">
                  <v-divider :key="'work-divider' + index" v-if="index > 0" class="py-1" />
                  <div :key="'work-' + index" class="py-1 d-flex justify-space-between">
                    <WorkExp
                      :company-name="exp.company_topic_name"
                      :position-name="exp.position_topic_name"
                    />
                    <div>
                      <EditIcon class="pl-1" @click="showWorkExpEditor(index)" />
                      <UpIcon class="pl-1" @click="moveUpFrom(index, workExps)" />
                      <DownIcon class="pl-1" @click="moveDownFrom(index, workExps)" />
                      <DeleteIcon class="pl-1" @click="removeFrom(index, workExps)" />
                    </div>
                  </div>
                </template>
                <v-dialog v-model="workExpEditorShown" max-width="600">
                  <v-card>
                    <v-card-title>编辑工作经历</v-card-title>
                    <v-card-text v-if="editedWorkExp">
                      <v-text-field v-model="editedWorkExp.company_topic_name" label="公司名" />
                      <v-text-field v-model="editedWorkExp.position_topic_name" label="职位名" />
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn small depressed @click="workExpEditorShown = false">取消</v-btn>
                      <v-btn small depressed color="primary" @click="saveWorkExpEditDraft"
                        >保存草稿</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card>

              <v-dialog v-model="showRemoveConfirm" max-width="600">
                <v-card>
                  <v-card-title>从草稿中删除？</v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn small depressed @click="showRemoveConfirm = false">取消</v-btn>
                    <v-btn small depressed color="warning" @click="removeCallback">确认</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-form>
            <v-card-actions class="px-4">
              <v-spacer></v-spacer>
              <v-btn depressed smal @click="cancel">取消</v-btn>
              <v-btn depressed smal @click="resetAll(reset)">重置</v-btn>
              <v-btn
                :disabled="!valid || submitIntermediate"
                color="primary"
                depressed
                smal
                @click="handleSubmit(submit)"
              >
                保存
              </v-btn>
            </v-card-actions>
          </div>
        </ValidationObserver>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router/composables';
import { api2 } from '@/api2';
import { apiPeople } from '@/api/people';
import { editor_T, ITopic, IUserUpdateMe } from '@/interfaces';
import { readToken, readUserProfile } from '@/store/main/getters';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { deepCopy, getRecentYears } from '@/utils';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';
import { api } from '@/api';
import { VditorCF } from 'chafan-vue-editors';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { getVditorUploadConfig } from '@/common';
import UpIcon from '@/components/icons/UpIcon.vue';
import DownIcon from '@/components/icons/DownIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import WebIcon from '@/components/icons/WebIcon.vue';
import GithubIcon from '@/components/icons/GithubIcon.vue';
import TwitterIcon from '@/components/icons/TwitterIcon.vue';
import LinkedinIcon from '@/components/icons/LinkedinIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import EduExp from '@/components/EduExp.vue';
import WorkExp from '@/components/WorkExp.vue';
import ValidateUrl from '@/components/base/ValidateUrl.vue';
import ZhihuIcon from '@/components/icons/ZhihuIcon.vue';
import { useAuth, useResponsive, useDayjs } from '@/composables';

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
const { dayjs } = useDayjs();

const valid = ref(true);
const newResidencyTopicNames = ref<string[]>([]);
const newProfessionTopicNames = ref<string[]>([]);
const userUpdateMe = reactive<IUserUpdateMe>({
  full_name: '',
  handle: '',
  personal_introduction: '',
});
const newWorkExpCompanyName = ref('');
const newWorkExpPositionName = ref('');
const eduExpLeveNames = ['高中及以下', '大专', '本科', '硕士', '博士及以上'];
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
const vditor = ref<any>(null);

const eduExpEditedIndex = ref<number | null>(null);
const eduExpEditorShown = ref(false);
const editedEduExp = ref<IUserEducationExperienceItem | null>(null);

const workExpEditedIndex = ref<number | null>(null);
const workExpEditorShown = ref(false);
const editedWorkExp = ref<IUserWorkExperienceItem | null>(null);

const showRemoveConfirm = ref(false);
const removeCallback = ref<(() => void) | null>(null);

const vditorUploadConfig = computed(() => {
  return getVditorUploadConfig(readToken(store));
});

onMounted(async () => {
  years.value = getRecentYears(dayjs);
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

  await dispatchCaptureApiError(store, async () => {
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

function resetAll(reset: () => void) {
  const profile = readUserProfile(store);
  if (profile) {
    newResidencyTopicNames.value = profile.residency_topics.map((topic) => topic.name);
    newProfessionTopicNames.value = profile.profession_topics.map((topic) => topic.name);
    Object.keys(userUpdateMe).forEach((key) => {
      userUpdateMe[key] = profile[key];
    });
  }
  reset();
}

function cancel() {
  router.back();
}

async function submit() {
  submitIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
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
      commitSetUserProfile(store, response.data);
      commitAddNotification(store, {
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
    commitAddNotification(store, {
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

function showAddNewEduExpDialog() {
  editedEduExp.value = {};
  eduExpEditedIndex.value = eduExps.value.length;
  eduExpEditorShown.value = true;
}

function showAddNewWorkExpDialog() {
  editedWorkExp.value = {};
  workExpEditedIndex.value = workExps.value.length;
  workExpEditorShown.value = true;
}

function removeFrom(index: number, arr: any[]) {
  arr.splice(index, 1);
}

function moveUpFrom(index: number, arr: any[]) {
  if (index === 0) {
    return;
  }
  const e = arr[index];
  arr.splice(index, 1);
  arr.splice(index - 1, 0, e);
}

function moveDownFrom(index: number, arr: any[]) {
  if (index === arr.length - 1) {
    return;
  }
  const e = arr[index];
  arr.splice(index, 1);
  arr.splice(index + 1, 0, e);
}

async function uploadAvatar() {
  uploadAvatarIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    if (fileInput !== null) {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size <= 128) {
          commitAddNotification(store, {
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
  await dispatchCaptureApiError(store, async () => {
    const fileInput = document.getElementById('gifFileInput') as HTMLInputElement;
    if (fileInput !== null) {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size <= 128) {
          commitAddNotification(store, {
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
  const vditorRef = vditor.value as any;
  userUpdateMe.about = vditorRef.getContent() || undefined;
}

function clearAboutMe() {
  const vditorRef = vditor.value as any;
  vditorRef.init(aboutEditor.value, '');
  showAboutEditor.value = false;
  showClearAboutMe.value = false;
  userUpdateMe.about = null;
}

function showEduExpEditor(index: number) {
  eduExpEditedIndex.value = index;
  editedEduExp.value = deepCopy(eduExps.value[index]);
  eduExpEditorShown.value = true;
}

function saveEduExpEditDraft() {
  if (eduExpEditedIndex.value !== null && editedEduExp.value) {
    eduExps.value.splice(eduExpEditedIndex.value, 1, editedEduExp.value);
    eduExpEditorShown.value = false;
  }
}

function showWorkExpEditor(index: number) {
  workExpEditedIndex.value = index;
  editedWorkExp.value = deepCopy(workExps.value[index]);
  workExpEditorShown.value = true;
}

function saveWorkExpEditDraft() {
  if (workExpEditedIndex.value !== null && editedWorkExp.value) {
    workExps.value.splice(workExpEditedIndex.value, 1, editedWorkExp.value);
    workExpEditorShown.value = false;
  }
}

function removeFromConfirm(index: number, arr: any[]) {
  showRemoveConfirm.value = true;
  removeCallback.value = () => {
    removeFrom(index, arr);
    showRemoveConfirm.value = false;
  };
}
</script>
