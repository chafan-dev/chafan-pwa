<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'v-col-8': display.mdAndUp }">
        <v-card class="ma-3 pa-3" variant="outlined">
          <v-card-title>
            <div class="text-h5 text-primary">绑定{{ botLabel }}</div>
          </v-card-title>

          <!-- Logged out: the whole point of this page is that the code
               appears on the screen of someone already signed in, so there is
               nothing to show until they are. -->
          <v-card-text v-if="!loggedIn">
            <p class="mb-4">生成绑定码需要先登录。</p>
            <v-btn color="primary" variant="flat" :to="loginTarget">去登录</v-btn>
          </v-card-text>

          <v-card-text v-else>
            <p class="mb-4">
              点下面的按钮生成一个绑定码，然后把它发给{{ botLabel }}。绑定码只在
              {{ expiryMinutes }} 分钟内有效，用一次就失效。
            </p>

            <div v-if="code" class="mb-4">
              <div class="text-medium-emphasis mb-1">你的绑定码</div>
              <div class="d-flex align-center flex-wrap ga-2">
                <code class="link-code">{{ code }}</code>
                <v-btn size="small" variant="text" @click="copy">
                  {{ copied ? '已复制' : '复制' }}
                </v-btn>
              </div>
              <div class="text-medium-emphasis mt-2">
                <template v-if="secondsLeft > 0">
                  {{ formattedTimeLeft }}后失效。只发给{{ botLabel }}，不要发给任何人。
                </template>
                <template v-else> 已失效，请重新生成。 </template>
              </div>
            </div>

            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <v-btn
              color="primary"
              variant="flat"
              :loading="loading"
              :disabled="loading"
              @click="generate"
            >
              {{ code ? '重新生成绑定码' : '生成绑定码' }}
            </v-btn>
          </v-card-text>

          <v-divider />

          <v-card-text class="text-medium-emphasis">
            <p class="mb-1">绑定后，机器人可以代你在茶饭上发表内容。</p>
            <p class="mb-0">
              它只看得到你输入给它的命令，读不到任何聊天记录。想解除绑定，在机器人那里运行
              <code>/chafan unlink</code>。
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { apiMe } from '@/api/me';
import { useAuth, useErrorHandling } from '@/composables';

const display = useDisplay();
const route = useRoute();
const { token, loggedIn } = useAuth();
const { commitErrMsg } = useErrorHandling();

const code = ref<string | null>(null);
const secondsLeft = ref(0);
const loading = ref(false);
const copied = ref(false);
const errorMessage = ref<string | null>(null);
let ticker: ReturnType<typeof setInterval> | null = null;

// `?from=discord` only changes what the page calls the bot. It is never used to
// decide anything: whoever holds a configured secret can redeem the code, and
// this page has no way to know which bot the user will hand it to.
const KNOWN_BOTS: Record<string, string> = {
  discord: 'Discord 机器人',
};
const botLabel = computed(() => {
  const from = route.query.from;
  return (typeof from === 'string' && KNOWN_BOTS[from]) || '机器人';
});

const loginTarget = computed(() => ({
  path: '/login',
  query: { redirect: route.fullPath },
}));

const expiryMinutes = ref(10);

const formattedTimeLeft = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60);
  const seconds = secondsLeft.value % 60;
  if (minutes > 0) {
    return `${minutes} 分 ${seconds.toString().padStart(2, '0')} 秒`;
  }
  return `${seconds} 秒`;
});

function startCountdown(seconds: number) {
  secondsLeft.value = seconds;
  if (ticker) {
    clearInterval(ticker);
  }
  ticker = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0 && ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (ticker) {
    clearInterval(ticker);
  }
});

async function generate() {
  loading.value = true;
  errorMessage.value = null;
  copied.value = false;
  try {
    const response = await apiMe.createBotLinkCode(token.value);
    code.value = response.data.code;
    expiryMinutes.value = Math.max(1, Math.round(response.data.expires_in_seconds / 60));
    startCountdown(response.data.expires_in_seconds);
  } catch (error) {
    errorMessage.value = '生成绑定码失败，请稍后再试。';
    commitErrMsg(error as AxiosError);
  } finally {
    loading.value = false;
  }
}

async function copy() {
  if (!code.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(code.value);
    copied.value = true;
  } catch {
    // Clipboard access is denied over plain http and in some embedded
    // browsers. The code is on screen and short enough to retype, so this is
    // not worth an error message.
    copied.value = false;
  }
}
</script>

<style scoped>
.link-code {
  font-size: 1.6rem;
  letter-spacing: 0.2em;
  padding: 0.3em 0.6em;
  border-radius: 4px;
  background-color: rgb(var(--v-theme-surface-variant), 0.25);
  user-select: all;
}
</style>
