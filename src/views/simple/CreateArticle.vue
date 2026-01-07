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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiArticle } from '@/api/article';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { v4 as uuidv4 } from 'uuid';
import { info } from '@/logging';
import { useAuth } from '@/composables';

const { token, loggedIn } = useAuth();

const article_title = ref('title');
const column_uuid = ref('uuid');
const article_content = ref('body');

function parseQueryParams(): Map<string, string> {
  const queryMap = new Map<string, any>([
    ['article_title', ''],
    ['column_uuid', ''],
    ['article_content', ''],
  ]);
  const params = new URLSearchParams(window.location.search);
  for (const [key, value_raw] of params.entries()) {
    const value = decodeURIComponent(value_raw);
    queryMap.set(key, value);
  }
  return queryMap;
}

onMounted(() => {
  info('mounted');
  if (!loggedIn.value) {
    info('not logged');
  } else {
    info('logged in');
  }
  info(window.location.search);
  const params = parseQueryParams();
  setTimeout(() => {
    article_title.value = params.get('article_title')!;
    column_uuid.value = params.get('column_uuid')!;
    article_content.value = params.get('article_content')!;
  }, 50);
});

async function submitArticle() {
  info('submitArticle');

  const response = await apiArticle.postArticle(token.value, {
    title: article_title.value,
    content: {
      source: article_content.value,
      editor: 'wysiwyg',
    },
    visibility: 'anyone',
    is_published: true,
    article_column_uuid: column_uuid.value,
    writing_session_uuid: 'simple_editor:' + uuidv4(),
  });
  if (response.status == 200) {
    const href = window.location.origin + '/articles/' + response.data.uuid;
    info('Create Article succeeded. Jumping to such page: ' + href);
    window.open(href, '_blank')!.focus();
  } else {
    info('POST article failed!');
    info(response.toString());
  }
}
</script>
