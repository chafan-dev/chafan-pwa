<template>
  <v-main>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md6>
            <ValidationObserver v-slot="{ handleSubmit, valid }">
            <v-card class="elevation-12">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{appName}} 注册</v-toolbar-title>
                    <v-spacer />
                    <LangPicker />
                </v-toolbar>
                <v-card-text>
                    <div class="black--text mb-4">
                        注册前请仔细阅读<a class="text-decoration-none" href="https://about.cha.fan/docs" target="_blank">本网站相关文档</a>。
                        如果你继续注册使用本网站，将视为同意<a class="text-decoration-none" href="https://about.cha.fan/docs/user-agreement/" target="_blank">「网站用户协议」</a>
                        并了解<a class="text-decoration-none" href="https://about.cha.fan/docs/code-of-conduct/" target="_blank">「社区行为守则」</a>的内容。
                    </div>
                    <v-form autocomplete="off">
                        <h3>{{$t('请先填入邀请码（20位）')}}</h3>
                        <ValidationProvider name="邀请码" rules="required" v-slot="{ errors }">
                            <v-text-field v-model="invitationToken" name="邀请码" type="text" required />
                            <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>

                        <v-divider class="mt-2 mb-4" />

                        <h3>{{$t('注册信息')}}</h3>

                        <ValidationProvider name="email" rules="required|email" v-slot="{ errors }">
                            <v-text-field v-model="email" name="login" :label="$t('Email')" type="text">
                                <template v-slot:prepend><AccountIcon /></template>
                            </v-text-field>
                            <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>

                        <v-text-field v-model="verificationCode"
                                      name="verification-code" :label="$t('验证码')" type="text">
                            <template v-slot:prepend><VerifyCodeIcon /></template>
                        </v-text-field>

                        <ValidationProvider name="password" rules="required|password" v-slot="{ errors }">
                            <v-text-field v-model="password"
                                          name="new-password" :label="$t('Password')"
                                          autocomplete="new-password"
                                          type="password" required>
                                <template v-slot:prepend><PasswordIcon /></template>
                            </v-text-field>
                            <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>

                        <ValidationProvider name="handle" rules="required" v-slot="{ errors }">
                            <v-text-field v-model="handle"
                                            name="handle" :label="$t('Unique username (you can change this later)')"
                                            type="text" required>
                                <template v-slot:prepend><HandleIcon /></template>
                            </v-text-field>
                            <span class="error--text">{{ errors[0] }}</span>
                        </ValidationProvider>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn small depressed color="primary" @click="sendVerificationCode"
                           :disabled="intermediate || verificationCodeSent">{{$t('Send me verification code')}}</v-btn>
                    <v-btn small depressed color="primary" @click="handleSubmit(openAccount)"
                           :disabled="intermediate || !valid">{{$t('Verify code and open account')}}</v-btn>
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
import { api } from '@/api';
import { appName } from '@/env';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import HandleIcon from '@/components/icons/HandleIcon.vue';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';

import LangPicker from '@/components/LangPicker.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';

// TODO: share a parent component with Login.vue
@Component({
  components: { LangPicker, AccountIcon, PasswordIcon, HandleIcon, VerifyCodeIcon },
})
export default class Signup extends Vue {
    private email: string = '';
    private password: string = '';
    private handle: string = '';
    private appName = appName;
    private verificationCode: string = '';
    private invitationToken: string = '';

    private intermediate = false;
    private verificationCodeSent = false;

    private mounted() {
        commitSetShowLoginPrompt(this.$store, false);
        if (this.$router.currentRoute.query.invitation_link_uuid) {
            this.invitationToken = this.$router.currentRoute.query.invitation_link_uuid.toString();
        }
    }

    private async sendVerificationCode() {
        this.intermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            const response = await api.sendVerificationCode({ email: this.email });
            if (response) {
                commitAddNotification(this.$store, {
                    content: response.data.msg,
                    color: 'success',
                });
            }
            this.verificationCodeSent = true;
            this.intermediate = false;
        });
    }
    private async openAccount() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.intermediate = true;
            const response = await api.openAccount(this.email, this.handle, this.verificationCode, this.password, this.invitationToken);
            if (response) {
                commitAddNotification(this.$store, {
                    content: this.$t('账号创建成功，返回登陆界面').toString(),
                    color: 'success',
                });
                this.$router.push('/login');
            }
            this.intermediate = false;
        });
    }
}
</script>

<style>
</style>
