<template>
  <v-main>
    <v-container fill-height fluid>
      <v-layout align-center justify-center>
        <v-flex md6 sm8 xs12>
          <ValidationObserver v-slot="{ handleSubmit, valid }">
            <DebugSpan>valid: {{ valid }}</DebugSpan>
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} 注册</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <div class="black--text mb-4">
                  注册前请仔细阅读<a
                    class="text-decoration-none"
                    href="https://about.cha.fan/docs"
                    target="_blank"
                    >本网站相关文档</a
                  >。 如果你继续注册使用本网站，将视为同意<a
                    class="text-decoration-none"
                    href="https://about.cha.fan/docs/user-agreement/"
                    target="_blank"
                    >「网站用户协议」</a
                  >
                  并了解<a
                    class="text-decoration-none"
                    href="https://about.cha.fan/docs/code-of-conduct/"
                    target="_blank"
                    >「社区行为守则」</a
                  >的内容。
                  <a
                    href="https://about.cha.fan/signup"
                    class="text-decoration-none"
                    target="_blank"
                  >
                    了解如何获取邀请码 </a
                  >。
                </div>
                <v-form autocomplete="off">
                  <h3>请先填入邀请码（20位）</h3>
                  <ValidationProvider v-slot="{ errors }" name="邀请码" rules="required">
                    <v-text-field v-model="invitationToken" name="邀请码" required type="text" />
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>

                  <v-divider class="mt-2 mb-4" />

                  <h3>注册信息</h3>

                  <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
                    <v-text-field v-model="email" label="邮箱地址" name="login" type="text">
                      <template v-slot:prepend>
                        <AccountIcon />
                      </template>
                    </v-text-field>
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>

                  <v-text-field
                    v-model="verificationCode"
                    label="验证码"
                    name="verification-code"
                    type="text"
                    :disabled="!email || !isEmail(email)"
                  >
                    <template v-slot:prepend>
                      <VerifyCodeIcon />
                    </template>
                    <template v-slot:append-outer>
                      <VerificationCodeBtn
                        :send-verification-code-handler="sendVerificationCode"
                        :disabled-prop="!email || !isEmail(email)"
                      />
                    </template>
                  </v-text-field>

                  <ValidationProvider v-slot="{ errors }" name="password" rules="required|password">
                    <v-text-field
                      v-model="password"
                      label="密码"
                      autocomplete="new-password"
                      name="new-password"
                      required
                      type="password"
                      :disabled="!verificationCode"
                    >
                      <template v-slot:prepend>
                        <PasswordIcon />
                      </template>
                    </v-text-field>
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>

                  <ValidationProvider v-slot="{ errors }" name="用户ID" rules="required|id">
                    <v-text-field
                      v-model="handle"
                      label="用户ID"
                      name="handle"
                      required
                      type="text"
                      :disabled="!verificationCode"
                    >
                      <template v-slot:prepend>
                        <HandleIcon />
                      </template>
                    </v-text-field>
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :disabled="intermediate || !valid"
                  color="primary"
                  depressed
                  small
                  @click="handleSubmit(openAccount)"
                >
                  验证并注册
                </v-btn>
              </v-card-actions>
            </v-card>
          </ValidationObserver>
        </v-flex>
      </v-layout>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import store from '@/store';
import { useRoute, useRouter } from 'vue-router/composables';
import { api } from '@/api';
import { appName } from '@/env';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import HandleIcon from '@/components/icons/HandleIcon.vue';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';

import { dispatchCaptureApiError } from '@/store/main/actions';
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { email as emailRule } from 'vee-validate/dist/rules';

const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const handle = ref('');
const verificationCode = ref('');
const invitationToken = ref('');
const intermediate = ref(false);

onMounted(() => {
  commitSetShowLoginPrompt(store, false);
  if (route.query.invitation_link_uuid) {
    invitationToken.value = route.query.invitation_link_uuid.toString();
  }
});

async function sendVerificationCode() {
  return dispatchCaptureApiError(store, async () => {
    const response = await api.sendVerificationCode({ email: email.value });
    if (response) {
      const msg = response.data.success ? '验证码已发送到邮箱' : '发送失败';
      commitAddNotification(store, {
        content: msg,
        color: 'success',
      });
      return true;
    }
    return false;
  });
}

async function openAccount() {
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    const response = await api.openAccount(
      email.value,
      handle.value,
      verificationCode.value,
      password.value,
      invitationToken.value
    );
    if (response) {
      commitAddNotification(store, {
        content: '账号创建成功，返回登陆界面',
        color: 'success',
      });
      await router.push('/login');
    }
    intermediate.value = false;
  });
}

function isEmail(s: string) {
  return emailRule.validate(s);
}
</script>
