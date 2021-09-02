const webpack = require('webpack');
const { spawnSync } = require('child_process');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

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
        ),
        new SentryWebpackPlugin({
          // sentry-cli configuration - can also be done directly through sentry-cli
          // see https://docs.sentry.io/product/cli/configuration/ for details
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'nomad-research',
          project: 'chafan-prod',
          release: process.env.SENTRY_RELEASE,

          // other SentryWebpackPlugin configuration
          include: './dist',
          ignore: ['node_modules', 'webpack.config.js'],
        })
      );
      if (process.env.SENTRY_AUTH_TOKEN) {
        config.plugins.push(
          new SentryWebpackPlugin({
            // sentry-cli configuration - can also be done directly through sentry-cli
            // see https://docs.sentry.io/product/cli/configuration/ for details
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'nomad-research',
            project: 'chafan-prod',
            release: getGitCommitHash(),

            // other SentryWebpackPlugin configuration
            include: './dist',
            ignore: ['node_modules', 'webpack.config.js'],
          })
        );
      }
      config.performance = {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
    }
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
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      exclude: [/\.map$/, /_redirects/],
      skipWaiting: true,
    },
  },
  devServer: {
    disableHostCheck: true,
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
