<template>
  <v-main>
    <v-container fill-height fluid>
      <v-layout align-center justify-center>
        <v-flex >

          <ValidationObserver v-slot="{ handleSubmit, valid }">

            <DebugSpan>valid: {{ valid }}</DebugSpan>

            <v-card>

              <v-card-text>
                <v-form autocomplete="off">


                  <h3>快捷提交</h3>

                  <v-text-field
                    label="文章标题"
                    name="title"
                    type="text"
                  >
                  </v-text-field>

                  <v-text-field
                    label="专栏 UUID"
                    name="column_uuid"
                    type="text"
                  >
                  </v-text-field>

                  <v-textarea
                    label="body"
                    v-model="textInput"
                    auto-grow
                  ></v-textarea>

                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  depressed
                  small
                  @click="handleSubmit(submitArticle)"
                >
                  提交专栏文章
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
import { api } from '@/api';
import { appName } from '@/env';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import HandleIcon from '@/components/icons/HandleIcon.vue';
import VerifyCodeIcon from '@/components/icons/VerifyCodeIcon.vue';

import { dispatchCaptureApiError } from '@/store/main/actions';
import VerificationCodeBtn from '@/components/widgets/VerificationCodeBtn.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { email } from 'vee-validate/dist/rules';

// TODO: share a parent component with Login.vue
@Component({
  components: {
    DebugSpan,
    VerificationCodeBtn,
    AccountIcon,
    PasswordIcon,
    HandleIcon,
    VerifyCodeIcon,
  },
})
export default class Signup extends Vue {
  private email: string = '';
  private password: string = '';
  private handle: string = '';
  private appName = appName;
  private verificationCode: string = '';
  private invitationToken: string = '';

  private intermediate = false;

  private mounted() {
    commitSetShowLoginPrompt(this.$store, false);
    if (this.$route.query.invitation_link_uuid) {
      this.invitationToken = this.$route.query.invitation_link_uuid.toString();
    }
  }


    private async submitArticle() {
        console.log("submit");
//        console.log(JSON.stringify(this));
    }
  private async openAccount() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      const response = await api.openAccount(
        this.email,
        this.handle,
        this.verificationCode,
        this.password,
        this.invitationToken
      );
      if (response) {
        commitAddNotification(this.$store, {
          content: '账号创建成功，返回登陆界面',
          color: 'success',
        });
        await this.$router.push('/login');
      }
      this.intermediate = false;
    });
  }

  isEmail(s: string) {
    return email.validate(s);
  }
}
</script>
