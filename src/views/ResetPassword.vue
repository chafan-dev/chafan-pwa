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
                <LangPicker></LangPicker>
              </v-toolbar>
              <v-card-text>
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
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn small depressed @click="cancel">取消</v-btn>
                <v-btn small depressed @click="resetAll(reset)">重置</v-btn>
                <v-btn
                  small
                  depressed
                  :disabled="!valid"
                  color="primary"
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appName } from '@/env';
import { commitAddNotification } from '@/store/main/mutations';
import { dispatchResetPassword } from '@/store/main/actions';

import LangPicker from '@/components/LangPicker.vue';

@Component({
  components: { LangPicker },
})
export default class UserProfileEdit extends Vue {
  public appName = appName;
  public valid = true;
  public password = '';
  public confirmation = '';

  public mounted() {
    this.checkToken();
  }

  public resetAll() {
    this.password = '';
    this.confirmation = '';
  }

  public cancel() {
    this.$router.push('/');
  }

  public checkToken() {
    const token = this.$route.query.token as string;
    if (!token) {
      commitAddNotification(this.$store, {
        content: '无效的密码重置链接',
        color: 'error',
      });
      this.$router.push('/recover-password');
    } else {
      return token;
    }
  }

  public async submit() {
    const token = this.checkToken();
    if (token) {
      await dispatchResetPassword(this.$store, {
        token,
        password: this.password,
      });
      if (this.$route.path !== '/login') {
        await this.$router.push('/login');
      }
    }
  }
}
</script>
