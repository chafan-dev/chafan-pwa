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

              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  depressed
                  @click="handleSubmit(submitArticle)"
                >
                  提交专栏文章
                </v-btn>
              </v-card-actions>

                  <v-text-field
                    label="文章标题"
                    name="article_title"
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
                    label="article_content"
                    v-model="textInput"
                    auto-grow
                  ></v-textarea>

                </v-form>
              </v-card-text>
            </v-card>
          </ValidationObserver>
        </v-flex>
      </v-layout>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { api } from '@/api';
import { appName } from '@/env';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';

import { dispatchCaptureApiError } from '@/store/main/actions';
import DebugSpan from '@/components/base/DebugSpan.vue';

import { CVue } from '@/common';
import  { info }  from '@/logging'

// TODO: share a parent component with Login.vue
@Component({
  components: {
    DebugSpan,
  },
})
export default class SimpleSubmitArticle extends CVue {

    private parseQueryParams() : Map<string,string> {
        const params = new URLSearchParams(window.location.search);
        const queryMap = new Map<string, string>();
        for (const [key, value] of params.entries()) {
            queryMap.set(key, value);
        }
        return queryMap;
    }
    private getDOMElements() : Map<string,Node> {
        const title = document.getElementsByName("article_title")[0];
        const col_uuid = document.getElementsByName("column_uuid")[0];
        const content = document.getElementsByName("article_content")[0];
        const ret = new Map<string, Node>([
            ["article_title", title],
            ["column_uuid", col_uuid],
            ["article_content", content]
        ]);
        return ret;
    }
    private mounted() {
        info("mounted");
        if (!this.loggedIn) {
            info("not logged");
        } else {
            info("logged in");
        }
        info(window.location.search);
        const params = this.parseQueryParams();
        const doms = this.getDOMElements();
        params.forEach((value, key) => {
          console.log(`Key: ${key}, Value: ${value}`);
        });
        doms.forEach((value, key) => {
          console.log(`Key: ${key}, Value: ${value}`);
        });
    }


    private async submitArticle() {
        console.log("submit");
//        console.log(JSON.stringify(this));
    }
    /*
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
  */

}
</script>
