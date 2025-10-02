const webpack = require('webpack');
const fs = require('fs');
const { spawnSync } = require('child_process');

setGitInfo();

function getGitCommitHash() {
  return spawnSync('git', ['rev-parse', 'HEAD'], { timeout: 2000 }).stdout.toString('utf-8').trim();
}

module.exports = {
  // Fix Vuex-typescript in prod: https://github.com/istrib/vuex-typescript/issues/13#issuecomment-409869231
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions = Object.assign(
        {},
        config.optimization.minimizer[0].options.terserOptions,
        {
          ecma: 5,
          compress: {
            keep_fnames: true,
          },
          warnings: false,
          mangle: {
            keep_fnames: true,
          },
        }
      );
      config.plugins.push(
        new webpack.ContextReplacementPlugin(
          /highlight\.js\/lib\/languages$/,
          new RegExp(`^./(${['javascript', 'python', 'bash'].join('|')})$`)
        )
      );
    }
    config.performance = {
        maxEntrypointSize: 2500000,  // 2.5 MiB - increased to match actual app size
        maxAssetSize: 2000000,  // 2 MiB - increased to accommodate vendor chunks
    };
    config.devtool = 'source-map';
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) =>
        Object.assign(options, {
          transformAssetUrls: {
            'v-img': ['src', 'lazy-src'],
            'v-card': 'src',
            'v-card-media': 'src',
            'v-responsive': 'src',
          },
        })
      );

    // Suppress CSS chunk ordering warnings from mini-css-extract-plugin
    // These are harmless in most cases and commonly occur with Vuetify
    config.plugin('extract-css').tap((args) => {
      if (args[0]) {
        args[0].ignoreOrder = true;
      }
      return args;
    });
  },
  css: {
    loaderOptions: {
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
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      exclude: [/\.map$/, /_redirects/],
      skipWaiting: true,
    },
  },
  devServer: {
    allowedHosts: 'all',
    https:
      process.env.NODE_ENV === 'production'
        ? {
            key: fs.existsSync('./dev.cha.fan-key.pem')
              ? fs.readFileSync('./dev.cha.fan-key.pem')
              : undefined,
            cert: fs.existsSync('./dev.cha.fan.pem')
              ? fs.readFileSync('./dev.cha.fan.pem')
              : undefined,
          }
        : undefined,
    proxy: process.env.NODE_ENV === 'production' ? 'https://dev.cha.fan:8080/' : undefined,
  },
};

/** Set git information to process arguments */
function setGitInfo() {
  try {
    let commit = getGitCommitHash();
    let commitTime = spawnSync('git', ['show', '-s', '--format=%cI', 'HEAD'], {
      timeout: 2000,
    })
      .stdout.toString('utf-8')
      .trim();

    let branch = spawnSync('git', ['branch', '--show-current'], { timeout: 2000 })
      .stdout.toString()
      .trim();

    let tags = spawnSync('git', ['tag', '--points-at', 'HEAD'], { timeout: 2000 })
      .stdout.toString()
      .trim();

    // A single string containing current commit ID
    process.env.VUE_APP_GIT_COMMIT = commit;
    // A single string containing current branch name
    process.env.VUE_APP_GIT_BRANCH = branch;
    // A single string containing last commit time
    process.env.VUE_APP_GIT_COMMIT_TIME = commitTime;
    // A newline-separated string containing all tags applied to this commit,
    // or an empty string containing nothing.
    process.env.VUE_APP_GIT_TAGS = tags;

    console.log('Sending these variables to frontend:');
    console.log('Commit: ', commit);
    console.log('Branch: ', branch);
    console.log('Timestamp: ', commitTime);
  } catch (e) {
    console.error('Failed to get git version info:', e);
  }
}
