<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
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

              <v-card class="pa-4 my-3 c-card">
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
                      :isMobile="isMobile"
                      :onEditorChange="onEditorChange"
                      :vditorUploadConfig="vditorUploadConfig"
                    />
                  </div>
                </v-expand-transition>

                <!-- TODO: validate -->
                <v-text-field
                  v-model="userUpdateMe.personal_introduction"
                  clearable
                  label="个人签名"
                />
                <v-text-field v-model="userUpdateMe.homepage_url" clearable label="个人主页">
                  <template v-slot:prepend>
                    <WebIcon />
                  </template>
                </v-text-field>
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
                <v-text-field
                  v-model="userUpdateMe.linkedin_url"
                  clearable
                  label="Linkedin 主页地址"
                >
                  <template v-slot:prepend>
                    <LinkedinIcon />
                  </template>
                </v-text-field>

                <v-combobox
                  v-model="newResidencyTopicNames"
                  :delimiters="[',', '，', '、']"
                  hide-selected
                  label="居住过的地方"
                  multiple
                  small-chips
                />
                <v-text-field v-model="newProfessionTopicName" clearable label="所在行业" />
              </v-card>
              <v-card class="pa-4 my-3 c-card">
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

              <v-card class="pa-4 my-3 c-card">
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api2 } from '@/api2';
import { apiPeople } from '@/api/people';
import { editor_T, ITopic, IUserUpdateMe } from '@/interfaces';
import { readToken, readUserProfile } from '@/store/main/getters';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { deepCopy, getRecentYears } from '@/utils';
import ProfileIcon from '@/components/icons/ProfileIcon.vue';
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

@Component({
  components: {
    WorkExp,
    EduExp,
    EditIcon,
    LinkedinIcon,
    TwitterIcon,
    GithubIcon,
    WebIcon,
    DeleteIcon,
    DownIcon,
    UpIcon,
    CloseIcon,
    VditorCF,
    ProfileIcon,
  },
})
export default class UserProfileEdit extends Vue {
  public valid = true;
  private newResidencyTopicNames: string[] = [];
  private newProfessionTopicName: string = '';
  private userUpdateMe: IUserUpdateMe = {
    full_name: '',
    handle: '',
    personal_introduction: '',
  };
  private newWorkExpCompanyName = '';
  private newWorkExpPositionName = '';
  private readonly eduExpLeveNames = ['高中及以下', '大专', '本科', '硕士', '博士及以上'];
  private eduExps: IUserEducationExperienceItem[] = [];
  private workExps: IUserWorkExperienceItem[] = [];
  private submitIntermediate = false;
  private avatarURL = '#';
  private uploadAvatarIntermediate = false;
  private uploadGifAvatarIntermediate = false;
  private gifAvatarURL: string | null = null;
  private showGifAvatar = false;
  private aboutEditor: editor_T = 'wysiwyg';
  private showAboutEditor: boolean = false;
  private showClearAboutMe: boolean = false;
  private categoryTopics: ITopic[] | null = null;
  private years: string[] = [];

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get token() {
    return readToken(this.$store);
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.mdAndUp;
  }

  get vditorUploadConfig() {
    return getVditorUploadConfig(readToken(this.$store));
  }

  public async mounted() {
    this.years = getRecentYears(this.$dayjs);
    const userProfile = readUserProfile(this.$store);
    this.categoryTopics = (await api.getCategoryTopics()).data;
    if (userProfile) {
      if (userProfile.avatar_url) {
        this.avatarURL = userProfile.avatar_url;
      } else {
        this.avatarURL = '/img/default-avatar.png';
      }
      if (userProfile.gif_avatar_url) {
        this.gifAvatarURL = userProfile.gif_avatar_url;
        this.showGifAvatar = true;
      }
      Object.keys(this.userUpdateMe).forEach((key) => {
        this.userUpdateMe[key] = userProfile[key];
      });
      this.userUpdateMe.residency_topic_uuids = userProfile.residency_topics.map((t) => t.uuid);
      this.newResidencyTopicNames = userProfile.residency_topics.map((t) => t.name);

      this.userUpdateMe.homepage_url = userProfile.homepage_url;
      this.userUpdateMe.github_username = userProfile.github_username;
      this.userUpdateMe.twitter_username = userProfile.twitter_username;
      this.userUpdateMe.linkedin_url = userProfile.linkedin_url;

      if (userProfile.profession_topic) {
        this.userUpdateMe.profession_topic_uuid = userProfile.profession_topic.uuid;
        this.newProfessionTopicName = userProfile.profession_topic.name;
      }

      await dispatchCaptureApiError(this.$store, async () => {
        const response = await apiPeople.getUserEducationExperiences(this.token, userProfile.uuid);
        if (response.data) {
          this.eduExps = response.data.map((e) => {
            return {
              school_topic_name: e.school_topic.name,
              level_name: e.level,
              major: e.major,
              enroll_year: e.enroll_year,
              graduate_year: e.graduate_year,
            };
          });
        }
        const response2 = await apiPeople.getUserWorkExperiences(this.token, userProfile.uuid);
        if (response2.data) {
          this.workExps = response2.data.map((e) => {
            return {
              company_topic_name: e.company_topic.name,
              position_topic_name: e.position_topic.name,
            };
          });
        }
      });
    }
  }

  public resetAll(reset) {
    const userProfile = readUserProfile(this.$store);
    if (userProfile) {
      this.newResidencyTopicNames = userProfile.residency_topics.map((topic) => topic.name);
      Object.keys(this.userUpdateMe).forEach((key) => {
        this.userUpdateMe[key] = userProfile[key];
      });
    }
    reset();
  }

  public cancel() {
    this.$router.back();
  }

  public async submit() {
    this.submitIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const responses = await Promise.all(
        this.newResidencyTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
      );
      this.userUpdateMe.residency_topic_uuids = responses.map((r) => r.data.uuid);

      if (this.newProfessionTopicName) {
        const r = await apiTopic.createTopic(this.token, {
          name: this.newProfessionTopicName,
        });
        this.userUpdateMe.profession_topic_uuid = r.data.uuid;
      }

      const workExps = await Promise.all(
        this.workExps.map(async (e) => {
          if (e.company_topic_name && e.position_topic_name) {
            const r1 = await apiTopic.createTopic(this.token, {
              name: e.company_topic_name,
            });
            const r2 = await apiTopic.createTopic(this.token, {
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

      this.userUpdateMe.work_experiences = [];
      for (const e of workExps) {
        if (e !== null) {
          this.userUpdateMe.work_experiences.push(e);
        }
      }

      const eduExps = await Promise.all(
        this.eduExps.map(async (e) => {
          if (e.school_topic_name && e.level_name) {
            const r1 = await apiTopic.createTopic(this.token, {
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

      this.userUpdateMe.education_experiences = [];
      for (const e of eduExps) {
        if (e !== null) {
          this.userUpdateMe.education_experiences.push(e);
        }
      }

      const response = await apiMe.updateMe(this.token, this.userUpdateMe);
      if (response) {
        commitSetUserProfile(this.$store, response.data);
        commitAddNotification(this.$store, {
          content: '更新成功',
          color: 'success',
        });
        await this.$router.push({
          name: 'user',
          params: { handle: response.data.handle },
          query: { details: 'true' },
        });
      }
      this.submitIntermediate = false;
    });
  }

  public addNewWorkExp() {
    if (!this.newWorkExpCompanyName || !this.newWorkExpPositionName) {
      commitAddNotification(this.$store, {
        content: '公司名和职位均为必填',
        color: 'error',
      });
      return;
    }
    this.workExps.push({
      company_topic_name: this.newWorkExpCompanyName,
      position_topic_name: this.newWorkExpPositionName,
    });
    this.newWorkExpCompanyName = '';
    this.newWorkExpPositionName = '';
  }

  public showAddNewEduExpDialog() {
    this.editedEduExp = {};
    this.eduExpEditedIndex = this.eduExps.length;
    this.eduExpEditorShown = true;
  }

  public showAddNewWorkExpDialog() {
    this.editedWorkExp = {};
    this.workExpEditedIndex = this.workExps.length;
    this.workExpEditorShown = true;
  }

  public removeFrom(index: number, arr) {
    arr.splice(index, 1);
  }

  public moveUpFrom(index: number, arr) {
    if (index === 0) {
      return;
    }
    const e = arr[index];
    arr.splice(index, 1);
    arr.splice(index - 1, 0, e);
  }

  public moveDownFrom(index: number, arr) {
    if (index === arr.length - 1) {
      return;
    }
    const e = arr[index];
    arr.splice(index, 1);
    arr.splice(index + 1, 0, e);
  }

  private async uploadAvatar() {
    this.uploadAvatarIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput !== null) {
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          if (file.size <= 10 * 1024) {
            commitAddNotification(this.$store, {
              content: '头像文件过小',
              color: 'error',
            });
            this.uploadAvatarIntermediate = false;
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
          this.avatarURL = resized.dataUrl;
          const response = await api2.uploadFile(this.token, formData);
          this.userUpdateMe.avatar_url = response.data.url;
        }
      }
      this.uploadAvatarIntermediate = false;
    });
  }

  private async uploadGifAvatar() {
    this.uploadGifAvatarIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const fileInput = document.getElementById('gifFileInput') as HTMLInputElement;
      if (fileInput !== null) {
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          if (file.size <= 10 * 1024) {
            commitAddNotification(this.$store, {
              content: '头像文件过小',
              color: 'error',
            });
            this.uploadGifAvatarIntermediate = false;
            return;
          }
          const formData = new FormData();

          formData.append('file', file);

          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = () => {
            this.gifAvatarURL = fileReader.result as string;
          };
          const response = await api2.uploadFile(this.token, formData);
          this.userUpdateMe.gif_avatar_url = response.data.url;
        }
      }
      this.uploadGifAvatarIntermediate = false;
    });
  }

  private showFilePicker() {
    document.getElementById('fileInput')?.click();
  }

  private showGifFilePicker() {
    this.showGifAvatar = true;
    document.getElementById('gifFileInput')?.click();
  }

  private onEditorChange() {
    const vditor = this.$refs.vditor as any;
    this.userUpdateMe.about = vditor.getContent() || undefined;
  }

  private clearAboutMe() {
    const vditor = this.$refs.vditor as any;
    vditor.init(this.aboutEditor, '');
    this.showAboutEditor = false;
    this.showClearAboutMe = false;
    this.userUpdateMe.about = null;
  }

  private eduExpEditedIndex: number | null = null;
  private eduExpEditorShown = false;
  private editedEduExp: IUserEducationExperienceItem | null = null;
  private showEduExpEditor(index: number) {
    this.eduExpEditedIndex = index;
    this.editedEduExp = deepCopy(this.eduExps[index]);
    this.eduExpEditorShown = true;
  }

  private saveEduExpEditDraft() {
    if (this.eduExpEditedIndex !== null && this.editedEduExp) {
      this.eduExps.splice(this.eduExpEditedIndex, 1, this.editedEduExp);
      this.eduExpEditorShown = false;
    }
  }

  private workExpEditedIndex: number | null = null;
  private workExpEditorShown = false;
  private editedWorkExp: IUserWorkExperienceItem | null = null;
  private showWorkExpEditor(index: number) {
    this.workExpEditedIndex = index;
    this.editedWorkExp = deepCopy(this.workExps[index]);
    this.workExpEditorShown = true;
  }

  private saveWorkExpEditDraft() {
    if (this.workExpEditedIndex !== null && this.editedWorkExp) {
      this.workExps.splice(this.workExpEditedIndex, 1, this.editedWorkExp);
      this.workExpEditorShown = false;
    }
  }

  private showRemoveConfirm = false;
  private removeCallback: (() => void) | null = null;
  removeFromConfirm(index: number, arr) {
    this.showRemoveConfirm = true;
    this.removeCallback = () => {
      this.removeFrom(index, arr);
      this.showRemoveConfirm = false;
    };
  }
}
</script>
