<template>
  <v-main>
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col md="4" sm="8" cols="12">
          <Form v-slot="{ handleSubmit }">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} - 密码重置</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <DebugSpan>tokenIsValid: {{ tokenIsValid }}</DebugSpan>
                <template v-if="tokenIsValid">
                  <p class="text-subtitle-1">在下方输入你的新密码</p>
                  <v-form @keyup.enter="handleSubmit(submit)" @submit.prevent="">
                    <Field v-slot="{ errors }" name="password" rules="required|min:3|password|password1:@confirm" v-model="password">
                      <v-text-field
                        v-model="password"
                        label="密码"
                        required
                        type="password"
                        :error-messages="errors"
                      />
                    </Field>
                    <Field v-slot="{ errors }" name="confirm" rules="required" v-model="confirmation">
                      <v-text-field
                        v-model="confirmation"
                        label="确认密码"
                        required
                        type="password"
                        :error-messages="errors"
                      />
                    </Field>
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
                <v-btn variant="tonal" size="small" @click="cancel">取消</v-btn>
                <v-btn variant="tonal" size="small" @click="resetAll">重置</v-btn>
                <v-btn color="primary" variant="flat" size="small" @click="handleSubmit(submit)">
                  保存
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
import { useRoute, useRouter } from 'vue-router';
import { appName } from '@/env';
import { api } from '@/api';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const route = useRoute();
const router = useRouter();

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
    const resetOk = await store.resetPassword({
      token,
      password: password.value,
    });
    if (resetOk) {
      await router.push('/login');
    }
  }
}
</script>
