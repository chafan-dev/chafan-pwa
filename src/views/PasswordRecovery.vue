<template>
  <v-main>
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col md="4" sm="8" cols="12">
          <Form v-slot="{ handleSubmit }">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} - 密码找回</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="text-subtitle-1">一封用于找回密码的邮件会发送到你的邮箱</p>
                <v-form @keyup.enter="handleSubmit(submit)" @submit.prevent="">
                  <Field v-slot="{ errors }" name="email" rules="required|email" v-model="email">
                    <v-text-field
                      v-model="email"
                      label="邮箱地址"
                      required
                      type="text"
                      :error-messages="errors"
                      @keyup.enter="handleSubmit(submit)"
                    >
                      <template v-slot:prepend>
                        <AppIcon name="Account"  />
                      </template>
                    </v-text-field>
                  </Field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn variant="tonal" @click="cancel">取消</v-btn>
                <v-btn color="primary" variant="flat" @click.prevent="handleSubmit(submit)">
                  发送
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
import { ref } from 'vue';
import { Form, Field } from 'vee-validate';
import { useRouter } from 'vue-router';
import { appName } from '@/env';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();

const router = useRouter();
const email = ref('');

function cancel() {
  router.back();
}

function submit() {
  store.passwordRecovery({ email: email.value });
}
</script>
