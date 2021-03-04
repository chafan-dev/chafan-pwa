<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <ValidationObserver v-slot="{ handleSubmit, reset }">
          <v-card class="ma-3 pa-3">
            <v-card-title primary-title>
              <div class="headline primary--text">{{$t('Change Password')}}</div>
            </v-card-title>
            <v-card-text>
              <template>
                <v-form>
                  <ValidationProvider rules="required|password|password1:@confirm" v-slot="{ errors }" name="password">
                    <v-text-field :label="$t('Password')" type="password" v-model="password" />
                    <span class="error--text">{{ $t(errors[0]) }}</span>
                  </ValidationProvider>

                  <ValidationProvider rules="required" v-slot="{ errors }" name="confirm">
                    <v-text-field :label="$t('Password confirmation')" type="password" v-model="confirmation" />
                    <span class="error--text">{{ $t(errors[0]) }}</span>
                  </ValidationProvider>
                </v-form>
              </template>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn small color="primary" @click="() => {handleSubmit(submit);reset()}" :disabled="intermediate">
                {{$t('Save')}}
                <v-progress-circular size="20" indeterminate v-if="intermediate" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </ValidationObserver>

        <ValidationObserver v-slot="{ handleSubmit }">
          <v-card class="ma-3 pa-3" :loading="!userProfile">
            <v-card-title primary-title>
              <div class="headline primary--text">{{$t('Manage logins')}}</div>
            </v-card-title>
            <div class="pa-4" v-if="userProfile">
                <div>
                  <div v-if="phoneNumber" class="mb-2">
                    <CellphoneIcon /> {{$t('Cellphone number')}}: {{ phoneNumber }}
                    <EditIcon v-if="!editLoginMode" @click="editLoginMode = 'cellphone'" />
                  </div>
                  <div class="mb-2">
                    <div>
                      <EmailIcon /> {{$t('Email')}}: {{ userProfile.email }}
                        <v-chip small color="primary">{{$t('primary')}}</v-chip>
                      <EditIcon v-if="!editLoginMode" @click="editLoginMode = 'email'" />
                    </div>
                    <div v-for="secondaryEmail in userProfile.secondary_emails" :key="secondaryEmail" class="mt-1">
                      <EmailIcon /> {{$t('Email')}}: {{ secondaryEmail }}
                        <v-chip small>{{$t('secondary')}}</v-chip>
                      <DeleteIcon v-if="!editLoginMode || !intermediate" @click="removeSecondaryEmail(secondaryEmail)" />
                      <v-progress-circular size="20" indeterminate v-if="intermediate" />
                    </div>
                  </div>
                </div>

                <v-divider v-if="editLoginMode" class="mt-3 mb-2" />
                <v-form v-if="editLoginMode === 'cellphone'">
                  <ValidationProvider rules="phone_number_e164" v-slot="{ errors }" name="phone-number">
                    <v-text-field :label="$t('Phone number')" type="text" v-model="phoneNumber" >
                      <template v-slot:prepend><CellphoneIcon /></template>
                    </v-text-field>
                    <span class="error--text">{{ $t(errors[0]) }}</span>
                  </ValidationProvider>

                  <v-text-field v-model="verificationCode" name="verification-code"
                                :label="$t('验证码')" type="text" v-show="showCodeInput">
                      <template v-slot:prepend><VerifyCodeIcon /></template>
                  </v-text-field>
                </v-form>

                <v-form v-if="editLoginMode === 'email' || editLoginMode === 'add_secondary_email'">
                  <ValidationProvider rules="email" v-slot="{ errors }" name="email">
                    <v-text-field :label="$t('Email')" type="text" v-model="newEmail">
                      <template v-slot:prepend><EmailIcon /></template>
                    </v-text-field>
                    <span class="error--text">{{ $t(errors[0]) }}</span>
                  </ValidationProvider>

                  <v-text-field v-model="verificationCode" name="verification-code"
                                :label="$t('验证码')" type="text" v-show="showCodeInput">
                      <template v-slot:prepend><VerifyCodeIcon /></template>
                  </v-text-field>
                </v-form>
            </div>
            <v-card-actions>
              <v-spacer />
              <v-btn small @click="editLoginMode = 'add_secondary_email'" v-show="!editLoginMode">
                {{$t('Add secondary email')}}
              </v-btn>
              <v-btn small @click="editLoginMode = 'cellphone'" v-show="!editLoginMode && !phoneNumber">
                {{$t('Add phone number')}}
              </v-btn>
              <v-btn small @click="editLoginMode = null" v-show="editLoginMode">
                {{$t('Cancel')}}
              </v-btn>

              <v-btn small :color="!showVerifyCodeBtn ? 'primary': undefined"
                     :disabled="verificationCodeDisabled || intermediate"
                     @click="handleSubmit(sendVerificationCode)" v-show="editLoginMode">
                {{$t('Send me verification code')}}
                <v-progress-circular size="20" indeterminate v-if="intermediate" />
              </v-btn>

              <v-btn small color="primary" @click="handleSubmit(verifyCode)" :disabled="intermediate"
                     v-show="showVerifyCodeBtn && editLoginMode">
                {{$t('Verify and save')}}
                <v-progress-circular size="20" indeterminate v-if="intermediate" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </ValidationObserver>

        <v-card class="ma-3 pa-3" :loading="!userProfile">
          <v-card-title>{{$t('Others')}}</v-card-title>
          <v-card-actions>
            <v-btn @click="showSecurityLogs">{{$t('查看安全日志')}}</v-btn>
          </v-card-actions>
        </v-card>
        <v-dialog v-model="showSecurityLogsDialog" max-width="600">
          <v-card :loading="auditLogs === null">
            <v-card-title>{{$t('安全日志')}}</v-card-title>
            <v-card-text v-if="auditLogs">
              <v-data-table :items="auditLogs" :headers="auditLogHeaders" :items-per-page="10">
                <template v-slot:item.created_at="{ item }">
                  <span v-if="item.created_at">{{ $dayjs.utc(item.created_at).local().fromNow() }}</span>
                </template>
                <template v-slot:item.api="{ item }">
                  <span v-if="item.api === '/login/access-token'">{{$t('获取登录token')}}</span>
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
import { Component, Vue } from 'vue-property-decorator';
import { IUserProfileUpdate, IUserUpdateLoginPhoneNumber, IUserUpdateSecondaryEmails,
IUserUpdatePrimaryEmail, IVerificationCodeRequest, IAuditLog } from '@/interfaces';
import { readUserProfile } from '@/store/main/getters';
import { dispatchUpdateUserProfile } from '@/store/main/actions';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import { apiMe } from '@/api/me';
import { api } from '@/api';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';
import CellphoneIcon from '@/components/icons/CellphoneIcon.vue';
import EmailIcon from '@/components/icons/EmailIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';

@Component({
  components: { VerifyCodeIcon, CellphoneIcon, EmailIcon, EditIcon, DeleteIcon },
})
export default class Security extends Vue {

  get userProfile() {
    return readUserProfile(this.$store);
  }
  private password: string | null = null;
  private confirmation: string | null = null;
  private phoneNumber: string | null = null;
  private newEmail: string | null = null;
  private showCodeInput = false;

  private verificationCodeDisabled = false;
  private showSecurityLogsDialog = false;

  private showVerifyCodeBtn = false;
  private editLoginMode: 'cellphone' | 'email' | 'add_secondary_email' | null = null;

  private intermediate = false;
  private verificationCode: string = '';

  private readonly auditLogHeaders = [
    { text: this.$t('Created at'), value: 'created_at' },
    { text: this.$t('API'), value: 'api' },
    { text: this.$t('IP'), value: 'ipaddr' },
  ];


  private auditLogs: IAuditLog[] | null = null;

  private async sendVerificationCode() {
    if (!this.editLoginMode) {
      return;
    }
    if (this.editLoginMode === 'cellphone' && !this.phoneNumber) {
      commitAddNotification(this.$store, {
          content: this.$t('电话号码为空').toString(),
          color: 'error',
      });
      return;
    }
    if ((this.editLoginMode === 'email' || this.editLoginMode === 'add_secondary_email') && !this.newEmail) {
      commitAddNotification(this.$store, {
          content: this.$t('电子邮件地址为空').toString(),
          color: 'error',
      });
      return;
    }

    this.showCodeInput = true;
    this.intermediate = true;

    await dispatchCaptureApiError(this.$store, async () => {
        const payload: IVerificationCodeRequest = {};
        if (this.editLoginMode === 'cellphone') {
          payload.phone_number = this.phoneNumber!;
        }
        if (this.editLoginMode === 'email' || this.editLoginMode === 'add_secondary_email') {
          payload.email = this.newEmail!;
        }
        const response = await api.sendVerificationCode(payload);
        if (response) {
            commitAddNotification(this.$store, {
                content: response.data.msg,
                color: 'success',
            });
            this.showVerifyCodeBtn = true;
            this.showCodeInput = true;
            this.verificationCodeDisabled = true;
        }
        this.intermediate = false;
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
          response = await apiMe.updatePrimaryEmail(this.$store.state.main.token, payload);
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
                content: this.$t('更新成功').toString(),
                color: 'success',
            });
            commitSetUserProfile(this.$store, response.data);
            this.showVerifyCodeBtn = false;
            this.editLoginMode = null;
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
      const newProfile = (await apiMe.updateSecondaryEmail(this.$store.state.main.token, payload)).data;
      commitAddNotification(this.$store, {
          content: this.$t('更新成功').toString(),
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
      this.$router.push('/');
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
