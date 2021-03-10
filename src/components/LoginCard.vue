<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary" v-if="showTopBar">
        <v-toolbar-title>{{appName}}</v-toolbar-title>
        <v-spacer />
        <LangPicker />
    </v-toolbar>
    <v-card-title class="headline primary--text" v-else>
        {{$t('Login')}}
    </v-card-title>
    <v-card-text>
        <v-form @keyup.enter="submit">
        <v-row>
            <v-col>
            <ValidationProvider name="email" rules="email" v-slot="{ errors }" v-if="loginMethod === 'email'">
                <v-text-field @keyup.enter="submit" v-model="email"
                            name="login" :label="$t('Email')" type="text">
                <template v-slot:prepend><AccountIcon /></template>
                </v-text-field>
                <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            <ValidationProvider name="phonenumber" rules="phone_number_e164" v-slot="{ errors }" v-else-if="loginMethod === 'cellphone'">
                <v-text-field @keyup.enter="submit" v-model="phoneNumber"
                            name="phonenumber" :label="$t('Cellphone number')" type="text">
                <template v-slot:prepend><CellphoneIcon /></template>
                </v-text-field>
                <span class="error--text">{{ errors[0] }}</span>
            </ValidationProvider>
            </v-col>
            <v-col class="col-4">
            <v-select :items="loginMethodItems" item-text="text"
                        item-value="code" v-model="loginMethod" :label="$t('Login method')" />
            </v-col>
        </v-row>
        <v-text-field @keyup.enter="submit" v-model="password" name="password"
                        :label="$t('Password')" id="password" type="password" v-if="loginMethod === 'email'">
            <template v-slot:prepend><PasswordIcon /></template>
        </v-text-field>
        <v-row v-if="loginMethod === 'cellphone'">
            <v-col>
            <v-text-field v-model="verificationCode" name="verification-code"
                            @keyup.enter="verifyCode"
                            :label="$t('验证码')" type="text">
                <template v-slot:prepend><VerifyCodeIcon /></template>
            </v-text-field>
            </v-col>
            <v-col>
            <v-btn small depressed color="primary" @click="sendVerificationCode" class="mt-4" :disabled="verificationCodeDisabled">
                {{$t('Send me verification code')}}</v-btn>
            </v-col>
        </v-row>
        </v-form>
        <div v-if="loginError">
        <v-alert :value="loginError" transition="fade-transition" type="error">
            Incorrect email or password
        </v-alert>
        </div>
        <v-flex class="caption text-xs-right">
        <router-link class="text-decoration-none" to="/recover-password">{{$t('Forgot your password?')}}</router-link>
        </v-flex>
    </v-card-text>
    <v-card-actions>
        <span class="mr-4">
            <a class="text-decoration-none" href="https://about.cha.fan/signup">
                <JoinChafanIcon /> {{ $t('如何加入 Chafan?') }}
            </a>
            </span>
        <span>
        <a class="text-decoration-none" href="mailto:contact@cha.fan">
            <EmailIcon /> {{ $t('联系我们') }}
        </a>
        </span>
        <v-spacer />
        <v-btn small depressed color="primary" @click.prevent="submit"
               :disabled="submitIntermediate || (loginMethod === 'cellphone' && !this.verificationCode)">
            {{$t('Login')}}
            <v-progress-circular :size="20" v-show="submitIntermediate" indeterminate />
        </v-btn>
        <v-btn small depressed to="/signup">{{$t('Sign-up')}}</v-btn>
    </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import JoinChafanIcon from '@/components/icons/JoinChafanIcon.vue';
import EmailIcon from '@/components/icons/EmailIcon.vue';
import CellphoneIcon from '@/components/icons/CellphoneIcon.vue';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';

import { appName } from '@/env';
import { readLoginError } from '@/store/main/getters';
import { dispatchLogIn } from '@/store/main/actions';
import LangPicker from '@/components/LangPicker.vue';
import { commitAddNotification } from '@/store/main/mutations';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { api } from '@/api';
import { captureException } from '@sentry/vue';

@Component({
  components: { LangPicker, AccountIcon, PasswordIcon, VerifyCodeIcon,
                JoinChafanIcon, EmailIcon, CellphoneIcon },
})
export default class LoginCard extends Vue {
    @Prop({default: true}) public readonly showTopBar!: boolean;

  private get loginError() {
    this.submitIntermediate = false;
    return readLoginError(this.$store);
  }
  private email: string = '';
  private phoneNumber: string = '';
  private password: string = '';
  private appName = appName;
  private loginMethod: 'email' | 'cellphone' = 'email';

  private readonly loginMethodItems = [
    {
      text: this.$t('Email').toString(),
      code: 'email',
    },
    {
      text: this.$t('Cellphone number').toString(),
      code: 'cellphone',
    },
  ];

  private submitIntermediate = false;
  private sendVerificationCodeIntermediate = false;

  private verificationCodeDisabled = false;

  private verificationCode: string | null = null;

  private async sendVerificationCode() {
    if (!this.phoneNumber) {
      commitAddNotification(this.$store, {
          content: this.$t('电话号码为空').toString(),
          color: 'error',
      });
      return;
    }
    this.sendVerificationCodeIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
        const response = await api.sendVerificationCode({ phone_number: this.phoneNumber! });
        if (response) {
            commitAddNotification(this.$store, {
                content: response.data.msg,
                color: 'success',
            });
            this.verificationCodeDisabled = true;
        }
        this.sendVerificationCodeIntermediate = false;
    });
  }
  private async submit() {
    this.submitIntermediate = true;
    try {
      if (this.loginMethod === 'email') {
        await dispatchLogIn(this.$store, {type: this.loginMethod, username: this.email, password: this.password});
      } else {
        if (this.verificationCode) {
          await dispatchLogIn(this.$store, {
            type: this.loginMethod,
            phoneNumber: this.phoneNumber,
            code: this.verificationCode,
          });
        }
      }
    } catch (err) {
      if (err.toString() === 'Error: Incorrect email or password') {
        commitAddNotification(this.$store, {
            content: this.$t('Incorrect email or password').toString(),
            color: 'error',
        });
      } else {
        captureException(err);
      }
    } finally {
      this.submitIntermediate = false;
    }
  }
}
</script>

<style>
</style>
