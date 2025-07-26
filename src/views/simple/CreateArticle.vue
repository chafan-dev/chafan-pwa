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
                    label="article_title 标题"
                    name="article_title"
                    v-model="article_title"
                    type="text"
                  >
                  </v-text-field>

                  <v-text-field
                    label="column_uuid 专栏 UUID"
                    name="column_uuid"
                    v-model="column_uuid"
                    type="text"
                  >
                  </v-text-field>

                  <v-textarea
                    label="article_content 正文"
                    name="article_content"
                    v-model="article_content"
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

    private article_title: string = "title";
    private column_uuid:string = "uuid";
    private article_content:string = "body";
    private mounted() {
        info("mounted");
        if (!this.loggedIn) {
            info("not logged");
        } else {
            info("logged in");
        }
        info(window.location.search);
        const params = this.parseQueryParams();
        params.forEach((value, key) => {
            console.log(`Key: ${key}, Value: ${value}`);
        });
        setTimeout(() => {
            this.article_title = params.get("article_title")!;
            this.column_uuid   = params.get("column_uuid")!;
            this.article_content = params.get("article_content")!;
        },50);
    }

    private parseQueryParams() : Map<string,string> {
        const queryMap = new Map<string,any> ([
            ["article_title", ""],
            ["column_uuid", ""],
            ["article_content", ""]
        ]);
        const params = new URLSearchParams(window.location.search);
        for (const [key, value_raw] of params.entries()) {
            const value = decodeURIComponent(value_raw);
            queryMap.set(key, value);
        }
        return queryMap;
    }

    private async submitArticle() {
        info("submitArticle");
        console.log(this.article_title);
        console.log(this.column_uuid);
        console.log(this.article_content);
        console.log(this.token);

/*
      await apiArticle.postArticle(vueInstance.$store.state.main.token, {
        title: edit.title,
        content: {
          source: edit.body,
          rendered_text: edit.rendered_body_text || '',
          editor: edit.editor,
        },
        visibility: edit.visibility,
        is_published: !edit.is_draft,
        writing_session_uuid: writingSessionUUID,
        article_column_uuid: articleColumnId,
      })
      */
    }

}
</script>
