<template>
  <v-main>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <ValidationObserver v-slot="{ handleSubmit, reset }">
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>{{ appName }} - {{ $t('Reset Password') }}</v-toolbar-title>
                <v-spacer />
                <LangPicker></LangPicker>
              </v-toolbar>
              <v-card-text>
                <p class="subheading">
                  {{ $t('Enter your new password below') }}
                </p>
                <v-form
                  @keyup.enter="handleSubmit(submit)"
                  v-model="valid"
                  ref="form"
                  @submit.prevent=""
                  lazy-validation
                >
                  <ValidationProvider
                    rules="required|min:3|password|password1:@confirm"
                    v-slot="{ errors }"
                    name="password"
                  >
                    <v-text-field
                      :label="$t('Password')"
                      type="password"
                      v-model="password"
                      required
                    />
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>

                  <ValidationProvider rules="required" v-slot="{ errors }" name="confirm">
                    <v-text-field
                      :label="$t('Password confirmation')"
                      type="password"
                      v-model="confirmation"
                      required
                    />
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="cancel">{{ $t('Cancel') }}</v-btn>
                <v-btn @click="resetAll(reset)">{{ $t('Reset') }}</v-btn>
                <v-btn @click="handleSubmit(submit)" :disabled="!valid" color="primary">{{
                  $t('Save')
                }}</v-btn>
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

// TODO: share a parent component with Login.vue
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

  public resetAll(reset) {
    this.password = '';
    this.confirmation = '';
  }

  public cancel() {
    this.$router.push('/');
  }

  public checkToken() {
    const token = this.$router.currentRoute.query.token as string;
    if (!token) {
      commitAddNotification(this.$store, {
        content: this.$t('No token provided in the URL, start a new password recovery').toString(),
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
      if (this.$router.currentRoute.path !== '/login') {
        this.$router.push('/login');
      }
    }
  }
}
</script>
