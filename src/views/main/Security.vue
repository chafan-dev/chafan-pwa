<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <ValidationObserver v-slot="{ handleSubmit, reset }">
          <v-card class="ma-3 pa-3">
            <v-card-title primary-title>
              <div class="headline primary--text">更新密码</div>
            </v-card-title>
            <v-card-text>
              <template>
                <v-form>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="password"
                    rules="required|password|password1:@confirm"
                  >
                    <v-text-field v-model="password" :label="$t('Password')" type="password" />
                    <span class="error--text">{{ $t(errors[0]) }}</span>
                  </ValidationProvider>

                  <ValidationProvider v-slot="{ errors }" name="confirm" rules="required">
                    <v-text-field v-model="confirmation" label="确认密码" type="password" />
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-form>
              </template>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :disabled="intermediate"
                color="primary"
                depressed
                small
                @click="
                  () => {
                    handleSubmit(submit);
                    reset();
                  }
                "
              >
                保存
                <v-progress-circular v-if="intermediate" indeterminate size="20" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </ValidationObserver>

        <ValidationObserver v-slot="{ handleSubmit }">
          <v-card :loading="!userProfile" class="ma-3 pa-3">
            <v-card-title primary-title>
              <div class="headline primary--text">管理登录方式</div>
            </v-card-title>
            <div v-if="userProfile" class="pa-4">
              <div>
                <div v-if="phoneNumber" class="mb-2">
                  <CellphoneIcon />
                  手机号：
                  {{ phoneNumber }}
                  <EditIcon v-if="!editLoginMode" @click="editLoginMode = 'cellphone'" />
                </div>
                <div class="mb-2">
                  <div>
                    <EmailIcon />
                    邮箱地址：{{ userProfile.email }}
                    <v-chip color="primary" small>主要</v-chip>
                    <EditIcon v-if="!editLoginMode" @click="editLoginMode = 'email'" />
                  </div>
                  <div
                    v-for="secondaryEmail in userProfile.secondary_emails"
                    :key="secondaryEmail"
                    class="mt-1"
                  >
                    <EmailIcon />
                    邮箱地址：{{ secondaryEmail }}
                    <v-chip small>次要</v-chip>
                    <DeleteIcon
                      v-if="!editLoginMode || !intermediate"
                      @click="removeSecondaryEmail(secondaryEmail)"
                    />
                    <v-progress-circular v-if="intermediate" indeterminate size="20" />
                  </div>
                </div>
              </div>

              <v-divider v-if="editLoginMode" class="mt-3 mb-2" />
              <v-form v-if="editLoginMode === 'cellphone'">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="phone-number"
                  rules="phone_number_e164"
                >
                  <v-text-field v-model="phoneNumber" label="手机号" type="text">
                    <template v-slot:prepend>
                      <CellphoneIcon />
                    </template>
                  </v-text-field>
                  <span class="error--text">{{ errors[0] }}</span>
                </ValidationProvider>

                <v-text-field
                  v-show="showCodeInput"
                  v-model="verificationCode"
                  label="验证码"
                  name="verification-code"
                  type="text"
                >
                  <template v-slot:prepend>
                    <VerifyCodeIcon />
                  </template>
                </v-text-field>
              </v-form>

              <v-form v-if="editLoginMode === 'email' || editLoginMode === 'add_secondary_email'">
                <ValidationProvider v-slot="{ errors }" name="email" rules="email">
                  <v-text-field
                    v-model="newEmail"
                    :label="
                      editLoginMode === 'email' ? '更改后的主要邮箱地址' : '新添加的次要邮箱地址'
                    "
                    type="text"
                  >
                    <template v-slot:prepend>
                      <EmailIcon />
                    </template>
                  </v-text-field>
                  <span class="error--text">{{ errors[0] }}</span>
                </ValidationProvider>

                <v-text-field
                  v-show="showCodeInput"
                  v-model="verificationCode"
                  label="验证码"
                  name="verification-code"
                  type="text"
                >
                  <template v-slot:prepend>
                    <VerifyCodeIcon />
                  </template>
                </v-text-field>
              </v-form>
            </div>
            <v-card-actions>
              <div class="text-caption grey--text">
                次要邮件地址验证后可以用于满足加入圈子的要求。
              </div>
              <v-spacer />
              <v-btn
                v-show="!editLoginMode"
                depressed
                small
                @click="editLoginMode = 'add_secondary_email'"
              >
                添加次要邮箱
              </v-btn>
              <v-btn
                v-show="!editLoginMode && !phoneNumber"
                depressed
                small
                @click="editLoginMode = 'cellphone'"
              >
                添加手机号
              </v-btn>
              <v-btn v-show="editLoginMode" depressed small @click="editLoginMode = null">
                取消
              </v-btn>

              <VerificationCodeBtn
                v-show="editLoginMode"
                :send-verification-code-handler="sendVerificationCode"
              />

              <v-btn
                v-show="editLoginMode"
                :disabled="intermediate"
                color="primary"
                depressed
                small
                @click="handleSubmit(verifyCode)"
              >
                验证并保存
                <v-progress-circular v-if="intermediate" indeterminate size="20" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </ValidationObserver>

        <v-card :loading="!userProfile" class="ma-3 pa-3">
          <v-card-title>其他</v-card-title>
          <v-card-actions>
            <v-btn depressed small @click="showSecurityLogs">查看安全日志</v-btn>
          </v-card-actions>
        </v-card>
        <v-dialog v-model="showSecurityLogsDialog" max-width="600">
          <v-card :loading="auditLogs === null">
            <v-card-title>安全日志</v-card-title>
            <v-card-text v-if="auditLogs">
              <v-data-table :headers="auditLogHeaders" :items="auditLogs" :items-per-page="10">
                <template v-slot:item.created_at="{ item }">
                  <span v-if="item.created_at">{{
                    $dayjs.utc(item.created_at).local().fromNow()
                  }}</span>
                </template>
                <template v-slot:item.api="{ item }">
                  <span
                    v-if="item.api === '/login/access-token' || item.api === 'create access token'"
                  >
                    获取登录token
                  </span>
                  <span v-if="item.api === 'post answer'">提交答案</span>
                  <span v-if="item.api === 'post question'">提交问题</span>
                  <span v-if="item.api === 'post article'">提交文章</span>
                  <span v-if="item.api === 'post submission'">提交分享</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  IAuditLog,
  IUserProfileUpdate,
  IUserUpdateLoginPhoneNumber,
  IUserUpdatePrimaryEmail,
  IUserUpdateSecondaryEmails,
  IVerificationCodeRequest,
} from '@/interfaces';
import { dispatchCaptureApiError, dispatchUpdateUserProfile } from '@/store/main/actions';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import { apiMe } from '@/api/me';
import { api } from '@/api';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';
import CellphoneIcon from '@/components/icons/CellphoneIcon.vue';
import EmailIcon from '@/components/icons/EmailIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import { AxiosError } from 'axios';
import { CVue } from '@/common';
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';

@Component({
  components: {
    VerificationCodeBtn,
    VerifyCodeIcon,
    CellphoneIcon,
    EmailIcon,
    EditIcon,
    DeleteIcon,
  },
})
export default class Security extends CVue {
  private password: string | null = null;
  private confirmation: string | null = null;
  private phoneNumber: string | null = null;
  private newEmail: string | null = null;
  private showCodeInput = false;
  private verificationCodeDisabled = false;
  private showSecurityLogsDialog = false;
  private editLoginMode: 'cellphone' | 'email' | 'add_secondary_email' | null = null;
  private intermediate = false;
  private verificationCode: string = '';
  private readonly auditLogHeaders = [
    { text: '创建于', value: 'created_at' },
    { text: 'API', value: 'api' },
    { text: 'IP', value: 'ipaddr' },
  ];
  private auditLogs: IAuditLog[] | null = null;

  private async sendVerificationCode() {
    if (!this.editLoginMode) {
      return;
    }
    if (this.editLoginMode === 'cellphone' && !this.phoneNumber) {
      commitAddNotification(this.$store, {
        content: '电话号码为空',
        color: 'error',
      });
      return;
    }
    if (
      (this.editLoginMode === 'email' || this.editLoginMode === 'add_secondary_email') &&
      !this.newEmail
    ) {
      commitAddNotification(this.$store, {
        content: '电子邮件地址为空',
        color: 'error',
      });
      return;
    }

    this.showCodeInput = true;

    return await dispatchCaptureApiError(this.$store, async () => {
      const payload: IVerificationCodeRequest = {};
      if (this.editLoginMode === 'cellphone') {
        payload.phone_number = this.phoneNumber!;
      }
      if (this.editLoginMode === 'email' || this.editLoginMode === 'add_secondary_email') {
        payload.email = this.newEmail!;
      }
      await api.sendVerificationCode(payload);
      commitAddNotification(this.$store, {
        content: '验证码已发送到邮箱，请查收',
        color: 'success',
      });
      this.showCodeInput = true;
      return true;
    });
  }

  private async verifyCode() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      let response;
      if (this.editLoginMode === 'cellphone') {
        const payload: IUserUpdateLoginPhoneNumber = {
          verification_code: this.verificationCode,
          phone_number: this.phoneNumber!,
        };
        response = await apiMe.updatePhoneNumber(this.$store.state.main.token, payload);
      } else if (this.editLoginMode === 'email') {
        const payload: IUserUpdatePrimaryEmail = {
          email: this.newEmail!,
          verification_code: this.verificationCode,
        };
        await apiMe
          .updatePrimaryEmail(this.$store.state.main.token, payload)
          .then((r) => {
            response = r;
          })
          .catch((err: AxiosError) => {
            this.commitErrMsg(err);
          });
      } else if (this.editLoginMode === 'add_secondary_email') {
        const payload: IUserUpdateSecondaryEmails = {
          secondary_email: this.newEmail!,
          action: 'add',
          verification_code: this.verificationCode,
        };
        response = await apiMe.updateSecondaryEmail(this.$store.state.main.token, payload);
      }
      if (response) {
        commitAddNotification(this.$store, {
          content: '更新成功',
          color: 'success',
        });
        commitSetUserProfile(this.$store, response.data);
        this.editLoginMode = null;
        this.newEmail = null;
        this.verificationCode = '';
        this.verificationCodeDisabled = false;
      }
      this.intermediate = false;
    });
  }

  private async removeSecondaryEmail(email: string) {
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      const payload: IUserUpdateSecondaryEmails = {
        secondary_email: email,
        action: 'remove',
      };
      const newProfile = (await apiMe.updateSecondaryEmail(this.$store.state.main.token, payload))
        .data;
      commitAddNotification(this.$store, {
        content: '更新成功',
        color: 'success',
      });
      commitSetUserProfile(this.$store, newProfile);
      this.intermediate = false;
    });
  }

  private resetAll() {
    this.password = '';
    this.confirmation = '';
  }

  private cancel() {
    this.$router.back();
  }

  private async mounted() {
    if (!this.userProfile) {
      await this.$router.push('/');
      return;
    }
    if (this.userProfile && this.userProfile.phone_number) {
      this.phoneNumber = this.userProfile.phone_number;
    }
  }

  private async submit() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      const updatedProfile: IUserProfileUpdate = {};
      if (this.password) {
        updatedProfile.password = this.password;
      }
      if (this.phoneNumber) {
        updatedProfile.phone_number = this.phoneNumber;
      }
      await dispatchUpdateUserProfile(this.$store, updatedProfile);
      this.resetAll();
      this.intermediate = false;
    });
  }

  private async showSecurityLogs() {
    this.showSecurityLogsDialog = true;
    this.auditLogs = (await api.getAuditLogs(this.$store.state.main.token)).data;
  }
}
</script>
