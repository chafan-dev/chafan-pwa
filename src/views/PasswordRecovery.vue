<template>
  <v-main>
    <v-container fill-height fluid>
      <v-layout align-center justify-center>
        <v-flex md4 sm8 xs12>
          <ValidationObserver v-slot="{ handleSubmit }">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ appName }} - {{ $t('Password Recovery') }}</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="subheading">
                  {{ $t('A password recovery email will be sent to the registered account') }}
                </p>
                <v-form
                  ref="form"
                  v-model="valid"
                  lazy-validation
                  @keyup.enter="submit"
                  @submit.prevent=""
                >
                  <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
                    <v-text-field
                      v-model="email"
                      :label="$t('Email')"
                      required
                      type="text"
                      @keyup.enter="handleSubmit(submit)"
                    >
                      <template v-slot:prepend>
                        <AccountIcon />
                      </template>
                    </v-text-field>
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn depressed @click="cancel">{{ $t('Cancel') }}</v-btn>
                <v-btn
                  depressed
                  :disabled="!valid"
                  color="primary"
                  @click.prevent="handleSubmit(submit)"
                >
                  {{ $t('Send') }}
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
import { dispatchPasswordRecovery } from '@/store/main/actions';
import AccountIcon from '@/components/icons/AccountIcon.vue';

// TODO: share a parent component with Login.vue
@Component({
  components: { AccountIcon },
})
export default class Login extends Vue {
  public valid = true;
  public email: string = '';
  public appName = appName;

  public cancel() {
    this.$router.back();
  }

  public submit() {
    dispatchPasswordRecovery(this.$store, { email: this.email });
  }
}
</script>

<style></style>
