<template>
  <v-main>
    <v-container fill-height fluid>
      <v-layout align-center justify-center>
        <v-flex md4 sm8 xs12>
          <ValidationObserver v-slot="{ handleSubmit, reset }">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} - 密码重置</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <DebugSpan>tokenIsValid: {{ tokenIsValid }}</DebugSpan>
                <template v-if="tokenIsValid">
                  <p class="subheading">在下方输入你的新密码</p>
                  <v-form
                    ref="form"
                    v-model="valid"
                    lazy-validation
                    @keyup.enter="handleSubmit(submit)"
                    @submit.prevent=""
                  >
                    <ValidationProvider
                      v-slot="{ errors }"
                      name="password"
                      rules="required|min:3|password|password1:@confirm"
                    >
                      <v-text-field v-model="password" label="密码" required type="password" />
                      <span class="error--text">{{ errors[0] }}</span>
                    </ValidationProvider>

                    <ValidationProvider v-slot="{ errors }" name="confirm" rules="required">
                      <v-text-field
                        v-model="confirmation"
                        label="确认密码"
                        required
                        type="password"
                      />
                      <span class="error--text">{{ errors[0] }}</span>
                    </ValidationProvider>
                  </v-form>
                </template>
                <p v-else>
                  <b
                    >无效的密码重置链接，可能已过期，<a
                      href="/recover-password"
                      class="text-decoration-none"
                      >请重试。</a
                    ></b
                  >
                </p>
              </v-card-text>
              <v-card-actions v-if="tokenIsValid">
                <v-spacer />
                <v-btn depressed small @click="cancel">取消</v-btn>
                <v-btn depressed small @click="resetAll(reset)">重置</v-btn>
                <v-btn
                  :disabled="!valid"
                  color="primary"
                  depressed
                  small
                  @click="handleSubmit(submit)"
                >
                  保存
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
import { useStore } from 'vuex';
import { useRoute, useRouter } from '@/router';
import { appName } from '@/env';
import { dispatchResetPassword } from '@/store/main/actions';
import { api } from '@/api';
import DebugSpan from '@/components/base/DebugSpan.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const valid = ref(false);
const tokenIsValid = ref(true);
const password = ref('');
const confirmation = ref('');

onMounted(() => {
  checkToken();
});

function resetAll() {
  password.value = '';
  confirmation.value = '';
}

function cancel() {
  router.push('/');
}

async function checkToken() {
  const token = route.query.token as string;
  let isValid = false;
  if (token) {
    const r = await api.checkTokenValidity(token);
    isValid = r.data.success;
  }
  if (!token || !isValid) {
    tokenIsValid.value = false;
    return null;
  } else {
    return token;
  }
}

async function submit() {
  const token = await checkToken();
  if (token) {
    const resetOk = await dispatchResetPassword(store, {
      token,
      password: password.value,
    });
    if (resetOk) {
      await router.push('/login');
    }
  }
}
</script>
