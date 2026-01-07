<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <ValidationObserver v-slot="{ handleSubmit, reset }">
          <v-card class="ma-3 pa-3" outlined>
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
                    <v-text-field v-model="password" label="密码" type="password" />
                    <span class="error--text">{{ errors[0] }}</span>
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

        <ValidationObserver v-slot="{ handleSubmit, valid }">
          <v-card :loading="!userProfile" class="ma-3 pa-3" outlined>
            <v-card-title primary-title>
              <div class="headline primary--text">管理登录方式</div>
            </v-card-title>
            <div v-if="userProfile" class="pa-4">
              <div>
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
              <div class="text-caption grey--text">
                次要邮件地址验证后可以用于满足加入圈子的要求。
              </div>
            </div>
            <v-card-actions>
              <v-spacer />
              <v-btn
                v-show="!editLoginMode"
                depressed
                small
                @click="editLoginMode = 'add_secondary_email'"
              >
                添加次要邮箱
              </v-btn>
              <v-btn v-show="editLoginMode" depressed small @click="editLoginMode = null">
                取消
              </v-btn>

              <VerificationCodeBtn
                v-show="editLoginMode"
                :disabled-prop="!valid"
                :send-verification-code-handler="sendVerificationCode"
              />

              <v-btn
                v-show="editLoginMode"
                :disabled="intermediate || !valid"
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

        <v-card :loading="!userProfile" class="ma-3 pa-3" outlined>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from '@/router';
import {
  IAuditLog,
  IUserProfileUpdate,
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
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import { useAuth, useErrorHandling } from '@/composables';

const store = useStore();
const router = useRouter();
const { token, userProfile } = useAuth();
const { commitErrMsg } = useErrorHandling();

const password = ref<string | null>(null);
const confirmation = ref<string | null>(null);
const newEmail = ref<string | null>(null);
const showCodeInput = ref(false);
const verificationCodeDisabled = ref(false);
const showSecurityLogsDialog = ref(false);
const editLoginMode = ref<'email' | 'add_secondary_email' | null>(null);
const intermediate = ref(false);
const verificationCode = ref('');
const auditLogHeaders = [
  { text: '创建于', value: 'created_at' },
  { text: 'API', value: 'api' },
  { text: 'IP', value: 'ipaddr' },
];
const auditLogs = ref<IAuditLog[] | null>(null);

async function sendVerificationCode() {
  if (!editLoginMode.value) {
    return;
  }
  if (
    (editLoginMode.value === 'email' || editLoginMode.value === 'add_secondary_email') &&
    !newEmail.value
  ) {
    commitAddNotification(store, {
      content: '电子邮件地址为空',
      color: 'error',
    });
    return;
  }

  showCodeInput.value = true;

  return await dispatchCaptureApiError(store, async () => {
    const payload: IVerificationCodeRequest = {};
    if (editLoginMode.value === 'email' || editLoginMode.value === 'add_secondary_email') {
      payload.email = newEmail.value!;
    }
    await api.sendVerificationCode(payload);
    commitAddNotification(store, {
      content: '验证码已发送到邮箱，请查收',
      color: 'success',
    });
    showCodeInput.value = true;
    return true;
  });
}

async function verifyCode() {
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    let response;
    if (editLoginMode.value === 'email') {
      const payload: IUserUpdatePrimaryEmail = {
        email: newEmail.value!,
        verification_code: verificationCode.value,
      };
      await apiMe
        .updatePrimaryEmail(token.value, payload)
        .then((r) => {
          response = r;
        })
        .catch((err: AxiosError) => {
          commitErrMsg(err);
        });
    } else if (editLoginMode.value === 'add_secondary_email') {
      const payload: IUserUpdateSecondaryEmails = {
        secondary_email: newEmail.value!,
        action: 'add',
        verification_code: verificationCode.value,
      };
      response = await apiMe.updateSecondaryEmail(token.value, payload);
    }
    if (response) {
      commitAddNotification(store, {
        content: '更新成功',
        color: 'success',
      });
      commitSetUserProfile(store, response.data);
      editLoginMode.value = null;
      newEmail.value = null;
      verificationCode.value = '';
      verificationCodeDisabled.value = false;
    }
    intermediate.value = false;
  });
}

async function removeSecondaryEmail(email: string) {
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    const payload: IUserUpdateSecondaryEmails = {
      secondary_email: email,
      action: 'remove',
    };
    const newProfile = (await apiMe.updateSecondaryEmail(token.value, payload)).data;
    commitAddNotification(store, {
      content: '更新成功',
      color: 'success',
    });
    commitSetUserProfile(store, newProfile);
    intermediate.value = false;
  });
}

function resetAll() {
  password.value = '';
  confirmation.value = '';
}

function cancel() {
  router.back();
}

onMounted(async () => {
  if (!userProfile.value) {
    await router.push('/');
    return;
  }
});

async function submit() {
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    const updatedProfile: IUserProfileUpdate = {};
    if (password.value) {
      updatedProfile.password = password.value;
    }
    await dispatchUpdateUserProfile(store, updatedProfile);
    resetAll();
    intermediate.value = false;
  });
}

async function showSecurityLogs() {
  showSecurityLogsDialog.value = true;
  auditLogs.value = (await api.getAuditLogs(token.value)).data;
}
</script>
