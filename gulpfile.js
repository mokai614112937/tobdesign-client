/*
单页应用js构建任务
改动根目录下的js，则编译被改动的js
改动非根目录下js,vue，都只编译根目录下的app.js
 */
const gulp = require('gulp')
const gutil = require('gulp-util')
const watch = require('gulp-watch')
const webpack = require('webpack')
const del = require('del')
const runSequence = require('run-sequence')
const browserSync = require('browser-sync').create()
const bsReload = browserSync.reload
const replace = require('gulp-replace')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const webpackConfig = require('./webpack.config.js')

const srcFiles = {
  lib: './source/lib/**/*',
  assets: './source/assets/**/*',
  htmlInRoot: './source/*.{html,ico}'
}

const dist = './dist'

gulp.task('copyHtml', function () {
  return gulp.src([srcFiles.htmlInRoot], { base: './source' }).pipe(gulp.dest(dist))
})
gulp.task('buildHtml', function () {
  return gulp.src([srcFiles.htmlInRoot], { base: './source' })
    .pipe(replace('<!-- replace by NODE_ENV -->', '<script>var NODE_ENV = "' + process.env.NODE_ENV + '"</script>'))
    .pipe(replace('[replace by time]', ~~(Date.now()/10000)))
    .pipe(gulp.dest(dist))
})
gulp.task('copyAssets', function () {
  return gulp.src([srcFiles.lib, srcFiles.assets], { base: './source' }).pipe(gulp.dest(dist))
})

// 在dev模式，监听js、根目录、assets目录下文件的更改，重新载入浏览器中的页面
gulp.task('dev', function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
  runSequence(
    'copyAssets',
    'copyHtml',
    function () {
      browserSync.init(dist, {
        startPath: '/', // 服务器运行时打开的页面
        server: {
          baseDir: [dist]
        },
        reloadDebounce: 1000, // 重载事件后1秒后才允许下次重载
        watchOptions: {
          ignoreInitial: true,
          ignored: ['node_modules', 'WEB-INF']
        }
      })

      webpackConfig.watch = true
      webpackConfig.devtool = 'cheap-source-map'
      webpackConfig.plugins.push(new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify('dev')
      }))
      webpack(webpackConfig).watch(200, function (err, stats) {
        if (err) {
          throw new gutil.PluginError('webpack', err)
        }
        gutil.log('webpack', stats.toString({
          colors: true,
          chunks: false,
          hash: false,
          version: false
        }))
        runSequence('buildHtml', bsReload)
      })

      watch([srcFiles.htmlInRoot], evt => {
        runSequence('buildHtml', bsReload)
      })
      watch([srcFiles.lib, srcFiles.assets, '!**/*.tmp', '!**/*._t_'], evt => {
        var path = evt.path
        gulp
          .src(path, { base: './source' })
          .pipe(gulp.dest(dist))
          .pipe(bsReload)
      })
    }
  )
})
// 在build模式，仅打包，不监听
gulp.task('build', function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'prod'
  runSequence(
    'clean',
    'copyAssets',
    'buildHtml',
    function () {
      webpackConfig.watch = false
      webpackConfig.devtool = undefined
      webpackConfig.plugins.push(new webpack.DefinePlugin({
        NODE_ENV: 'prod'
      }))
      webpack(webpackConfig, function (err, stats) {
        if (err) {
          throw new gutil.PluginError('webpack', err)
        }
        gutil.log(
          'webpack',
          stats.toString({
            colors: true,
            chunks: false,
            hash: false,
            version: false
          })
        )
      })
    }
  )
})
gulp.task('webserver', function () {
  browserSync.init(dist, {
    startPath: '/', // 服务器运行时打开的页面
    server: {
      baseDir: [dist]
    },
    reloadDebounce: 2000, // 重载事件后1秒后才允许下次重载
    port: 3000,
    ghostMode: false, // 点击，滚动和表单不要镜像到其他设备里
    codeSync: false // 不要发送任何文件改变事件给浏览器
  })
})
gulp.task('clean', function () {
  // 删除dist目录下的某些被编译出的文件
  return del(['./dist', '!./dist/node_modules/*', '!./dist/WEB-INF/*'])
})
