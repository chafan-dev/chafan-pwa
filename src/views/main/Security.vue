<template>
  <v-container fluid>
    <v-row class="mb-12" justify="center">
      <v-col :class="{ 'col-8': display.mdAndUp }">
        <Form v-slot="{ handleSubmit, resetForm }">
          <v-card class="ma-3 pa-3" variant="outlined">
            <v-card-title>
              <div class="text-h5 text-primary">更新密码</div>
            </v-card-title>
            <v-card-text>
                <v-form>
                  <Field
                    v-slot="{ errors }"
                    name="password"
                    rules="required|password|password1:@confirm"
                  >
                    <v-text-field v-model="password" label="密码" type="password" :error-messages="errors" />
                  </Field>

                  <Field v-slot="{ errors }" name="confirm" rules="required" v-model="confirmation">
                    <v-text-field v-model="confirmation" label="确认密码" type="password" :error-messages="errors" />
                  </Field>
                </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :disabled="intermediate"
                color="primary"
                variant="flat"
                size="small"
                @click="
                  () => {
                    handleSubmit(submit);
                    resetForm();
                  }
                "
              >
                保存
                <v-progress-circular v-if="intermediate" indeterminate size="20" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </Form>

        <Form v-slot="{ handleSubmit, meta }">
          <v-card :loading="!userProfile" class="ma-3 pa-3" variant="outlined">
            <v-card-title>
              <div class="text-h5 text-primary">管理登录方式</div>
            </v-card-title>
            <div v-if="userProfile" class="pa-4">
              <div>
                <div class="mb-2">
                  <div>
                    <AppIcon name="Email"  />
                    邮箱地址：{{ userProfile.email }}
                    <v-chip color="primary" size="small">主要</v-chip>
                    <AppIcon name="Edit" v-if="!editLoginMode" @click="editLoginMode = 'email'"  />
                  </div>
                  <div
                    v-for="secondaryEmail in userProfile.secondary_emails"
                    :key="secondaryEmail"
                    class="mt-1"
                  >
                    <AppIcon name="Email"  />
                    邮箱地址：{{ secondaryEmail }}
                    <v-chip size="small">次要</v-chip>
                    <AppIcon name="Delete"
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
                  <AppIcon name="VerifyCode"  />
                </template>
              </v-text-field>

              <v-form v-if="editLoginMode === 'email' || editLoginMode === 'add_secondary_email'">
                <Field v-slot="{ errors }" name="email" rules="email" v-model="newEmail">
                  <v-text-field
                    v-model="newEmail"
                    :label="
                      editLoginMode === 'email' ? '更改后的主要邮箱地址' : '新添加的次要邮箱地址'
                    "
                    type="text"
                    :error-messages="errors"
                  >
                    <template v-slot:prepend>
                      <AppIcon name="Email"  />
                    </template>
                  </v-text-field>
                </Field>

                <v-text-field
                  v-show="showCodeInput"
                  v-model="verificationCode"
                  label="验证码"
                  name="verification-code"
                  type="text"
                >
                  <template v-slot:prepend>
                    <AppIcon name="VerifyCode"  />
                  </template>
                </v-text-field>
              </v-form>
              <div class="text-caption text-grey">
                次要邮件地址验证后可以用于满足加入圈子的要求。
              </div>
            </div>
            <v-card-actions>
              <v-spacer />
              <v-btn
                v-show="!editLoginMode"
                variant="tonal"
                size="small"
                @click="editLoginMode = 'add_secondary_email'"
              >
                添加次要邮箱
              </v-btn>
              <v-btn v-show="editLoginMode" variant="tonal" size="small" @click="editLoginMode = null">
                取消
              </v-btn>

              <VerificationCodeBtn
                v-show="editLoginMode"
                :disabled-prop="!meta.valid"
                :send-verification-code-handler="sendVerificationCode"
              />

              <v-btn
                v-show="editLoginMode"
                :disabled="intermediate || !meta.valid"
                color="primary"
                variant="flat"
                size="small"
                @click="handleSubmit(verifyCode)"
              >
                验证并保存
                <v-progress-circular v-if="intermediate" indeterminate size="20" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </Form>

        <v-card :loading="!userProfile" class="ma-3 pa-3" variant="outlined">
          <v-card-title>其他</v-card-title>
          <v-card-actions>
            <v-btn variant="tonal" size="small" @click="showSecurityLogs">查看安全日志</v-btn>
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
import { Form, Field } from 'vee-validate';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import {
  IAuditLog,
  IUserProfileUpdate,
  IUserUpdatePrimaryEmail,
  IUserUpdateSecondaryEmails,
  IVerificationCodeRequest,
} from '@/interfaces';
import { apiMe } from '@/api/me';
import { api } from '@/api';
import { AxiosError } from 'axios';
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import { useAuth, useErrorHandling } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();
const display = useDisplay();

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
    store.notifications.push({
      content: '电子邮件地址为空',
      color: 'error',
    });
    return;
  }

  showCodeInput.value = true;

  return await store.captureApiError(async () => {
    const payload: IVerificationCodeRequest = {};
    if (editLoginMode.value === 'email' || editLoginMode.value === 'add_secondary_email') {
      payload.email = newEmail.value!;
    }
    await api.sendVerificationCode(payload);
    store.notifications.push({
      content: '验证码已发送到邮箱，请查收',
      color: 'success',
    });
    showCodeInput.value = true;
    return true;
  });
}

async function verifyCode() {
  await store.captureApiError(async () => {
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
      store.notifications.push({
        content: '更新成功',
        color: 'success',
      });
      store.userProfile = response.data;
      editLoginMode.value = null;
      newEmail.value = null;
      verificationCode.value = '';
      verificationCodeDisabled.value = false;
    }
    intermediate.value = false;
  });
}

async function removeSecondaryEmail(email: string) {
  await store.captureApiError(async () => {
    intermediate.value = true;
    const payload: IUserUpdateSecondaryEmails = {
      secondary_email: email,
      action: 'remove',
    };
    const newProfile = (await apiMe.updateSecondaryEmail(token.value, payload)).data;
    store.notifications.push({
      content: '更新成功',
      color: 'success',
    });
    store.userProfile = newProfile;
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
  await store.captureApiError(async () => {
    intermediate.value = true;
    const updatedProfile: IUserProfileUpdate = {};
    if (password.value) {
      updatedProfile.password = password.value;
    }
    await store.updateUserProfile(updatedProfile);
    resetAll();
    intermediate.value = false;
  });
}

async function showSecurityLogs() {
  showSecurityLogsDialog.value = true;
  auditLogs.value = (await api.getAuditLogs(token.value)).data;
}
</script>
