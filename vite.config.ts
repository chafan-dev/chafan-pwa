import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { spawnSync } from 'child_process';
import { resolve } from 'path';

function getGitInfo() {
  const run = (args: string[]) =>
    spawnSync('git', args, { timeout: 2000 }).stdout.toString('utf-8').trim();
  try {
    return {
      commit: run(['rev-parse', 'HEAD']),
      commitTime: run(['show', '-s', '--format=%cI', 'HEAD']),
      branch: run(['branch', '--show-current']),
      tags: run(['tag', '--points-at', 'HEAD']),
    };
  } catch {
    return { commit: '', commitTime: '', branch: '', tags: '' };
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const git = getGitInfo();

  return {
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            'v-img': ['src', 'lazy-src'],
            'v-card': 'src',
            'v-responsive': 'src',
          },
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        workbox: {
          globDirectory: resolve('dist'),
          // Hashed build output only. index.html is deliberately NOT precached:
          // precaching it made navigations cache-first, so a returning visitor
          // got the previous build's HTML (and therefore its asset hashes) for
          // a whole page view after every deploy.
          globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
          globIgnores: ['**/*.map'],
          skipWaiting: true,
          clientsClaim: true,
          // Must be an explicit null: vite-plugin-pwa defaults this to
          // 'index.html', and the generated NavigationRoute would then call
          // createHandlerBoundToURL on a URL we no longer precache, which
          // throws non-precached-url at runtime. Cloudflare Pages already
          // serves the app shell for every SPA route (see public/_redirects),
          // so navigations go to the network and fall back to cache on failure.
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-shell',
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 32 },
              },
            },
          ],
        },
        manifest: {
          name: '茶饭',
          short_name: '茶饭',
          theme_color: '#1976D2',
          background_color: '#1976d2',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/img/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/img/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        includeAssets: ['favicon.ico', 'img/icons/*.png'],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // Inject git info as compile-time constants
      'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(git.commit),
      'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(git.branch),
      'import.meta.env.VITE_GIT_COMMIT_TIME': JSON.stringify(git.commitTime),
      'import.meta.env.VITE_GIT_TAGS': JSON.stringify(git.tags),
    },
    css: {
      preprocessorOptions: {
        sass: {
          sassOptions: {
            quietDeps: true,
            silenceDeprecations: ['legacy-js-api', 'import', 'slash-div', 'global-builtin'],
          },
        },
        scss: {
          sassOptions: {
            quietDeps: true,
            silenceDeprecations: ['legacy-js-api', 'import', 'slash-div', 'global-builtin'],
          },
        },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia', 'vuetify'],
          },
          experimentalMinChunkSize: 10_000,
        },
      },
      // Largest chunk is ~780 kB; 1000 leaves headroom while surfacing regressions.
      chunkSizeWarningLimit: 1000,
    },
    server: {
      allowedHosts: true,
      proxy:
        mode === 'production'
          ? { '/api': { target: 'https://dev.cha.fan:8080/', changeOrigin: true } }
          : undefined,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      // Vitest owns tests/; e2e/ is Playwright's and must not be collected here.
      include: ['tests/**/*.spec.ts'],
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
    },
  };
});
