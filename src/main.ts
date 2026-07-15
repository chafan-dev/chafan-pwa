// styles
import './styles/app.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

// plugins
import vuetify from './plugins/vuetify';
import './plugins/vee-validate';
import i18n from './plugins/i18n';

import * as Sentry from '@sentry/vue';
import { sentryDSN } from '@/env';
import App from './App.vue';
import router from './router';

const app = createApp(App);

if (sentryDSN) {
  Sentry.init({
    app,
    dsn: sentryDSN,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.2,
    tracingOptions: {
      trackComponents: true,
    },
    maxValueLength: 2500,
  });
}

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(i18n);

app.mount('#app');
