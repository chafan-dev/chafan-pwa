<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <ValidationObserver v-slot="{ handleSubmit, reset }">
          <div v-if="userProfile" class="ma-3">
            <v-card-title primary-title>
              <div class="headline primary--text">
                {{ $t('Edit User Profile') }}
              </div>
              <v-spacer></v-spacer>
              <v-btn :to="`/users/${userProfile.handle}`" depressed small
                >{{ $t('个人资料') }}
              </v-btn>
            </v-card-title>
            <div class="pa-4">
              <template>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-row>
                    <v-col class="avatar-col">
                      <v-avatar class="avatarDiv" size="150" tile>
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
                        <span class="text-caption">{{ $t('点击更改默认头像') }}</span>
                        <v-btn depressed x-small @click="showGifAvatar = !showGifAvatar"
                          >{{ $t('添加额外的 GIF 头像') }}
                        </v-btn>
                      </div>
                      <v-expand-transition>
                        <v-avatar v-show="showGifAvatar" class="avatarDiv mt-2" size="150" tile>
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
                      <v-text-field v-model="userUpdateMe.full_name" :label="$t('Full Name')" />
                      <ValidationProvider
                        v-slot="{ errors }"
                        :name="$t('Username')"
                        rules="required"
                      >
                        <v-text-field
                          v-model="userUpdateMe.handle"
                          :label="
                            $t('Username') + ' (' + $t('这是你的唯一标识符，请谨慎更改') + ')'
                          "
                        />
                        <span class="error--text">{{ errors[0] }}</span>
                      </ValidationProvider>
                      <v-text-field
                        v-model="userUpdateMe.personal_introduction"
                        :label="$t('个人简介')"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <!-- TODO: validate -->
                      <v-text-field
                        v-model="userUpdateMe.homepage_url"
                        :label="$t('个人主页')"
                        clearable
                      />
                      <v-text-field
                        v-model="userUpdateMe.github_username"
                        :label="$t('Github 用户名')"
                        clearable
                      />
                      <v-text-field
                        v-model="userUpdateMe.twitter_username"
                        :label="$t('Twitter 用户名')"
                        clearable
                      />
                      <v-text-field
                        v-model="userUpdateMe.linkedin_url"
                        :label="$t('Linkedin 主页地址')"
                        clearable
                      />

                      <v-combobox
                        v-model="newResidencyTopicNames"
                        :delimiters="[',', '，', '、']"
                        :label="$t('居住过的地方')"
                        hide-selected
                        multiple
                        small-chips
                      />
                      <v-text-field
                        v-model="newProfessionTopicName"
                        :label="$t('所在行业')"
                        clearable
                      />

                      <div>
                        <span class="title">{{ $t('教育经历') }}</span>
                        <v-row v-for="(exp, index) in eduExps" :key="index">
                          <v-col>{{ exp.school_topic_name }}</v-col>
                          <v-col>{{ $t(exp.level_name) }}</v-col>
                          <v-col>
                            <v-btn
                              class="ml-2"
                              color="warning"
                              depressed
                              small
                              @click="removeEduExp(index)"
                              >{{ $t('删除') }}
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-text-field v-model="newEduExpSchooolName" :label="$t('学校名')" />
                          </v-col>
                          <v-col>
                            <v-combobox
                              v-model="newEduExpLevelName"
                              :items="eduExpLeveNames"
                              :label="$t('教育水平')"
                            />
                          </v-col>
                          <v-col align-self="center">
                            <v-btn
                              class="ma-2"
                              color="primary"
                              depressed
                              small
                              @click="addNewEduExp"
                              >{{ $t('确认添加') }}
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>

                      <div>
                        <span class="title">{{ $t('工作经历') }}</span>
                        <v-row v-for="(exp, index) in workExps" :key="index">
                          <v-col>{{ exp.company_topic_name }}</v-col>
                          <v-col>{{ exp.position_topic_name }}</v-col>
                          <v-col>
                            <v-btn
                              class="ma-2"
                              color="warning"
                              depressed
                              small
                              @click="removeWorkExp(index)"
                              >{{ $t('删除') }}
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-text-field v-model="newWorkExpCompanyName" :label="$t('机构名')" />
                          </v-col>
                          <v-col>
                            <v-text-field v-model="newWorkExpPositionName" :label="$t('职位名')" />
                          </v-col>
                          <v-col align-self="center">
                            <v-btn
                              class="ma-2"
                              color="primary"
                              depressed
                              small
                              @click="addNewWorkExp"
                              >{{ $t('确认添加') }}
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>
                    </v-col>
                  </v-row>
                </v-form>
              </template>
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn depressed smal @click="cancel">{{ $t('Cancel') }}</v-btn>
              <v-btn depressed smal @click="resetAll(reset)">{{ $t('Reset') }}</v-btn>
              <v-btn
                :disabled="!valid || submitIntermediate"
                color="primary"
                depressed
                smal
                @click="handleSubmit(submit)"
              >
                {{ $t('Save') }}
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
import { IUserUpdateMe } from '@/interfaces';
import { readToken, readUserProfile } from '@/store/main/getters';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { dispatchCaptureApiError } from '@/store/main/actions';

import ProfileIcon from '@/components/icons/ProfileIcon.vue';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';

interface IUserWorkExperienceInput {
  company_topic_name: string;
  position_topic_name: string;
}

interface IUserEducationExperienceInput {
  school_topic_name: string;
  level_name: string;
}

@Component({
  components: { ProfileIcon },
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
  private newEduExpSchooolName = '';
  private newEduExpLevelName = '';
  private readonly eduExpLeveNames = [
    this.$t('high_school_or_lower'),
    this.$t('dazhuan'),
    this.$t('bachelor'),
    this.$t('master'),
    this.$t('phd_or_higher'),
  ];
  private eduExps: IUserEducationExperienceInput[] = [];
  private workExps: IUserWorkExperienceInput[] = [];
  private submitIntermediate = false;
  private avatarURL = '#';
  private uploadAvatarIntermediate = false;
  private uploadGifAvatarIntermediate = false;
  private gifAvatarURL: string | null = null;
  private showGifAvatar = false;

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get token() {
    return readToken(this.$store);
  }

  public async mounted() {
    const userProfile = readUserProfile(this.$store);
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
      const topicsIds = responses.map((r) => r.data.uuid);
      this.userUpdateMe.residency_topic_uuids = topicsIds;

      if (this.newProfessionTopicName) {
        const r = await apiTopic.createTopic(this.token, {
          name: this.newProfessionTopicName,
        });
        this.userUpdateMe.profession_topic_uuid = r.data.uuid;
      }

      this.userUpdateMe.work_experiences = await Promise.all(
        this.workExps.map(async (e) => {
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
        })
      );

      this.userUpdateMe.education_experiences = await Promise.all(
        this.eduExps.map(async (e) => {
          const r1 = await apiTopic.createTopic(this.token, {
            name: e.school_topic_name,
          });
          return {
            school_topic_uuid: r1.data.uuid,
            level_name: e.level_name,
          };
        })
      );

      const response = await apiMe.updateMe(this.token, this.userUpdateMe);
      if (response) {
        commitSetUserProfile(this.$store, response.data);
        commitAddNotification(this.$store, {
          content: this.$t('设置更新成功').toString(),
          color: 'success',
        });
        this.$router.push(`/users/${response.data.handle}`);
      }
      this.submitIntermediate = false;
    });
  }

  public addNewWorkExp() {
    if (!this.newWorkExpCompanyName || !this.newWorkExpPositionName) {
      commitAddNotification(this.$store, {
        content: this.$t('公司名和职位均为必填').toString(),
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

  public removeWorkExp(index: number) {
    this.workExps.splice(index, 1);
  }

  public addNewEduExp() {
    if (!this.newEduExpSchooolName || !this.newEduExpLevelName) {
      commitAddNotification(this.$store, {
        content: this.$t('学校名和教育水平均为必填').toString(),
        color: 'error',
      });
      return;
    }
    this.eduExps.push({
      school_topic_name: this.newEduExpSchooolName,
      level_name: this.newEduExpLevelName,
    });
    this.newEduExpSchooolName = '';
    this.newEduExpLevelName = '';
  }

  public removeEduExp(index: number) {
    this.eduExps.splice(index, 1);
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
              content: this.$t('头像文件过小').toString(),
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
          this.userUpdateMe.avatar_url = response.data.msg;
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
              content: this.$t('头像文件过小').toString(),
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
          this.userUpdateMe.gif_avatar_url = response.data.msg;
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
}
</script>
<style scoped>
.avatarDiv {
  border: 1px solid grey;
}

.avatar-col {
  max-width: 180px !important;
}
</style>
