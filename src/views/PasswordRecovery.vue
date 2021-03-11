<template>
  <v-main>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <ValidationObserver v-slot="{ handleSubmit }">
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>{{ appName }} - {{ $t('Password Recovery') }}</v-toolbar-title>
                <v-spacer />
                <LangPicker />
              </v-toolbar>
              <v-card-text>
                <p class="subheading">
                  {{ $t('A password recovery email will be sent to the registered account') }}
                </p>
                <v-form
                  @keyup.enter="submit"
                  v-model="valid"
                  ref="form"
                  @submit.prevent=""
                  lazy-validation
                >
                  <ValidationProvider name="email" rules="required|email" v-slot="{ errors }">
                    <v-text-field
                      @keyup.enter="handleSubmit(submit)"
                      :label="$t('Email')"
                      type="text"
                      v-model="email"
                      required
                    >
                      <template v-slot:prepend><AccountIcon /></template>
                    </v-text-field>
                    <span class="error--text">{{ errors[0] }}</span>
                  </ValidationProvider>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="cancel">{{ $t('Cancel') }}</v-btn>
                <v-btn @click.prevent="handleSubmit(submit)" :disabled="!valid" color="primary">
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

import LangPicker from '@/components/LangPicker.vue';

// TODO: share a parent component with Login.vue
@Component({
  components: { LangPicker, AccountIcon },
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
