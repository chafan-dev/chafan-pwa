<template>
  <v-sheet v-bind="$attrs">
    <v-row align="center" class="fill-height" no-gutters>
      <v-col v-if="isDesktop && showTopBar" cols="12" md="6">
        <v-sheet color="primary darken-2" dark height="100vh" width="100%">
          <v-container class="justify-center" fill-height>
            <div class="d-flex align-center flex-column text-center">
              <h1 class="text-xl-h1 text-md-h2 font-weight-bold">
                {{ appName }}
              </h1>

              <h3 class="text-xl-h3 text-md-h4 mt-4">有深度的社交问答网站</h3>
            </div>
          </v-container>
        </v-sheet>
      </v-col>

      <v-col :lg="showTopBar ? 6 : 12" cols="12">
        <v-container>
          <v-row justify="center">
            <v-col
              :lg="showTopBar ? 6 : 11"
              :md="showTopBar ? 8 : 11"
              :xl="showTopBar ? 5 : 11"
              cols="12"
            >
              <Form v-slot="{ handleSubmit, meta }">
                <h3 class="text-h3 font-weight-bold text-center">登录</h3>

                <div class="mt-4">
                  <Field v-slot="{ errors }" name="email" rules="required|email" v-model="email">
                    <v-text-field
                      v-model="email"
                      label="邮箱地址"
                      name="login"
                      type="text"
                      :error-messages="errors"
                      @keyup.enter="submit"
                    >
                      <template v-slot:prepend>
                        <AppIcon name="AccountCircleOutline"  />
                      </template>
                    </v-text-field>
                  </Field>

                  <Field v-slot="{ errors }" name="password" rules="required" v-model="password">
                    <v-text-field
                      id="password"
                      v-model="password"
                      label="密码"
                      name="password"
                      required
                      type="password"
                      :error-messages="errors"
                      @keyup.enter="submit"
                    >
                      <template v-slot:prepend>
                        <AppIcon name="LockOutline"  />
                      </template>
                    </v-text-field>
                  </Field>

                  <v-sheet class="mb-2">
                    <div v-if="loginError">
                      <v-alert :value="loginError" transition="fade-transition" type="error">
                        邮箱地址或密码不正确
                      </v-alert>
                    </div>
                  </v-sheet>

                  <v-sheet>
                    <v-btn
                      :disabled="submitIntermediate || (enableCaptcha && !captchaToken) || !meta.valid"
                      block
                      class="text-white"
                      color="primary"
                      variant="flat"
                      size="large"
                      @click.prevent="handleSubmit(submit)"
                    >
                      登录
                      <v-progress-circular v-show="submitIntermediate" :size="20" indeterminate />
                    </v-btn>
                  </v-sheet>

                  <v-sheet :class="{ 'd-flex': isDesktop }" class="mt-4">
                    <v-btn
                      class="text-capitalize"
                      variant="text"
                      href="/recover-password"
                      link
                      size="small"
                    >
                      <AppIcon name="Help" class="mr-1"  />
                      忘记密码？
                    </v-btn>

                    <v-btn
                      class="text-capitalize"
                      variant="text"
                      href="https://about.cha.fan/signup"
                      link
                      size="small"
                    >
                      <AppIcon name="HelpCircleOutline" class="mr-1"  />
                      如何注册「茶饭」账号?
                    </v-btn>

                    <v-btn
                      class="text-capitalize"
                      variant="text"
                      href="mailto:contact@cha.fan"
                      link
                      size="small"
                    >
                      <AppIcon name="EmailEditOutline" class="mr-1"  />
                      联系我们
                    </v-btn>
                  </v-sheet>
                </div>
              </Form>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, Field } from 'vee-validate';
import { appName, enableCaptcha as enableCaptchaEnv } from '@/env';
import { captureException } from '@sentry/vue';
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import { useResponsive } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();

const props = withDefaults(
  defineProps<{
    showTopBar?: boolean;
  }>(),
  {
    showTopBar: true,
  }
);

const { isDesktop } = useResponsive();

const email = ref('');
const password = ref('');
const submitIntermediate = ref(false);
const verificationCode = ref<string | null>(null);
const captchaVerified = ref(false);
const captchaToken = ref<string | null>(null);

const enableCaptcha = computed(() => enableCaptchaEnv);

const loginError = computed(() => {
  submitIntermediate.value = false;
  return store.loginError;
});

async function submit() {
  submitIntermediate.value = true;
  try {
    if (enableCaptcha.value && !captchaToken.value) {
      submitIntermediate.value = false;
      return;
    }
    await store.logIn({
      username: email.value,
      password: password.value,
      hcaptcha_token: undefined,
    });
  } catch (err: any) {
    if (err.toString() === 'Error: Incorrect email or password') {
      store.notifications.push({
        content: '邮箱地址或密码不正确',
        color: 'error',
      });
    } else {
      captureException(err);
    }
  } finally {
    submitIntermediate.value = false;
  }
}

function verifiedCaptchaToken(token: string) {
  captchaVerified.value = true;
  captchaToken.value = token;
}
</script>
