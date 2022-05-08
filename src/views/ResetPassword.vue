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
                      style="text-decoration: none"
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appName } from '@/env';
import { dispatchResetPassword } from '@/store/main/actions';
import { api } from '@/api';
import DebugSpan from '@/components/base/DebugSpan.vue';
@Component({
  components: { DebugSpan },
})
export default class UserProfileEdit extends Vue {
  public appName = appName;
  public valid = false;
  private tokenIsValid = true;
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

  public async checkToken() {
    const token = this.$route.query.token as string;
    let isTokenValid = false;
    if (token) {
      const r = await api.checkTokenValidity(token);
      isTokenValid = r.data.success;
    }
    if (!token || !isTokenValid) {
      this.tokenIsValid = false;
      return null;
    } else {
      return token;
    }
  }

  public async submit() {
    const token = await this.checkToken();
    if (token) {
      const resetOk = await dispatchResetPassword(this.$store, {
        token,
        password: this.password,
      });
      if (resetOk) {
        await this.$router.push('/login');
      }
    }
  }
}
</script>
