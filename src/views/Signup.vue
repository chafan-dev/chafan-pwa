<template>
  <v-main>
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col md="6" sm="8" cols="12">
          <Form v-slot="{ handleSubmit, meta }">
            <DebugSpan>valid: {{ meta.valid }}</DebugSpan>
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} 注册</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <div class="text-black mb-4">
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
                  <Field v-slot="{ errors }" name="邀请码" rules="required" v-model="invitationToken">
                    <v-text-field v-model="invitationToken" name="邀请码" required type="text" :error-messages="errors" />
                  </Field>

                  <v-divider class="mt-2 mb-4" />

                  <h3>注册信息</h3>

                  <Field v-slot="{ errors }" name="email" rules="required|email" v-model="email">
                    <v-text-field v-model="email" label="邮箱地址" name="login" type="text" :error-messages="errors">
                      <template v-slot:prepend>
                        <AppIcon name="Account"  />
                      </template>
                    </v-text-field>
                  </Field>

                  <v-text-field
                    v-model="verificationCode"
                    label="验证码"
                    name="verification-code"
                    type="text"
                    :disabled="!email || !checkIsEmail(email)"
                  >
                    <template v-slot:prepend>
                      <AppIcon name="VerifyCode"  />
                    </template>
                    <template v-slot:append-outer>
                      <VerificationCodeBtn
                        :send-verification-code-handler="sendVerificationCode"
                        :disabled-prop="!email || !isEmail(email)"
                      />
                    </template>
                  </v-text-field>

                  <Field v-slot="{ errors }" name="password" rules="required|password" v-model="password">
                    <v-text-field
                      v-model="password"
                      label="密码"
                      autocomplete="new-password"
                      name="new-password"
                      required
                      type="password"
                      :disabled="!verificationCode"
                      :error-messages="errors"
                    >
                      <template v-slot:prepend>
                        <AppIcon name="Password"  />
                      </template>
                    </v-text-field>
                  </Field>

                  <Field v-slot="{ errors }" name="用户ID" rules="required|id" v-model="handle">
                    <v-text-field
                      v-model="handle"
                      label="用户ID"
                      name="handle"
                      required
                      type="text"
                      :disabled="!verificationCode"
                      :error-messages="errors"
                    >
                      <template v-slot:prepend>
                        <AppIcon name="Handle"  />
                      </template>
                    </v-text-field>
                  </Field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :disabled="intermediate || !meta.valid"
                  color="primary"
                  variant="flat"
                  size="small"
                  @click="handleSubmit(openAccount)"
                >
                  验证并注册
                </v-btn>
              </v-card-actions>
            </v-card>
          </Form>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Form, Field } from 'vee-validate';
import { email as isEmail } from '@vee-validate/rules';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api';
import { appName } from '@/env';

import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();

const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const handle = ref('');
const verificationCode = ref('');
const invitationToken = ref('');
const intermediate = ref(false);

onMounted(() => {
  store.showLoginPrompt = false;
  if (route.query.invitation_link_uuid) {
    invitationToken.value = route.query.invitation_link_uuid.toString();
  }
});

async function sendVerificationCode() {
  return store.captureApiError(async () => {
    const response = await api.sendVerificationCode({ email: email.value });
    if (response) {
      const msg = response.data.success ? '验证码已发送到邮箱' : '发送失败';
      store.notifications.push({
        content: msg,
        color: 'success',
      });
      return true;
    }
    return false;
  });
}

async function openAccount() {
  await store.captureApiError(async () => {
    intermediate.value = true;
    const response = await api.openAccount(
      email.value,
      handle.value,
      verificationCode.value,
      password.value,
      invitationToken.value
    );
    if (response) {
      store.notifications.push({
        content: '账号创建成功，返回登陆界面',
        color: 'success',
      });
      await router.push('/login');
    }
    intermediate.value = false;
  });
}

function checkIsEmail(s: string) {
  return isEmail(s) === true;
}
</script>
