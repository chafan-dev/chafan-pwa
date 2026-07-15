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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          globIgnores: ['**/*.map'],
          skipWaiting: true,
          navigateFallback: '/index.html',
          runtimeCaching: [],
        },
        manifest: {
          name: '茶饭',
          short_name: '茶饭',
          theme_color: '#1976D2',
          icons: [],
        },
        includeAssets: [],
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
      // Enable for Sentry uploads in CI if desired; keep off by default for public builds.
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }
            if (id.includes('vuetify') || id.includes('@mdi')) {
              return 'vuetify';
            }
            if (id.includes('vditor')) {
              return 'vditor';
            }
            if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('lowlight')) {
              return 'tiptap';
            }
            if (
              id.includes('/vue/') ||
              id.includes('vue-router') ||
              id.includes('pinia') ||
              id.includes('@vue/')
            ) {
              return 'vue-vendor';
            }
          },
          experimentalMinChunkSize: 10_000,
        },
      },
      // Surface real size regressions; editor chunks are lazy-loaded separately.
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
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
    },
  };
});
