const { src, dest, watch, parallel, series } = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const browsersync = require('browser-sync').create();
const imagemin = require('gulp-imagemin')
const del = require('del')

function browserSync() {
  browsersync.init({
    watch: true,
    server: "./app"
  });
}

function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 70, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}
function styles() {
  return src(
    'app/scss/style.scss'
  )
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: [' last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browsersync.stream())
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest('app/js'))
    .pipe(browsersync.stream())
}
function cleanDist() {
  return del('dist')
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], { base: 'app' })
    .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles)
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
  watch(['app/**/*.html']).on('change', browsersync.reload)
}
exports.browserSync = browserSync;
exports.scripts = scripts;
exports.styles = styles;
exports.watching = watching;
exports.images = images;
exports.build = series(cleanDist, images, build);
exports.cleanDist = cleanDist;
exports.default = parallel(browserSync, scripts, styles, watching, images, build);