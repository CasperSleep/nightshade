import gulp from'gulp';
import browsersync from 'browser-sync';
import fs from'fs';
import sass from'gulp-sass';
import autoprefixer from'gulp-autoprefixer';
import nunjucks from'gulp-nunjucks';
import nunjucksRender from'gulp-nunjucks-render';
// import mocha from'gulp-mocha';
import critical from'critical';
import sourcemaps from'gulp-sourcemaps';
import concat from'gulp-concat';
import rename from'gulp-rename';
import sassdoc from'sassdoc';

const browserSync = browsersync.create();

const file_paths =  {
    'base': './app',
    'dest': './dist',
    'css': './dist/assets/css/',
    'local_sass': './app/assets/scss/',
    'module_sass': './app/modules/',
    'views': './app/views/'
};


// Run tests
// gulp.task('test', () => {
//   return gulp.src('./test/dropdown.js', {read: false})
//     .pipe(mocha({
//       reporter: 'nyan'
//   }));
// });


// Compile Sass
gulp.task('sass', () => {
  return gulp.src(['./app/assets/scss/**/*.scss', './app/modules/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(file_paths.css))
    .pipe(browserSync.stream());
});


// Critical css
gulp.task('critical', ['sass', 'compile'], (cb) =>  {
  critical.generate({
    inline: true,
    base: 'dist/',
    css: ['dist/assets/css/application.css'],
    src: 'index.html',
    dest: 'dist/index-critical.html',
    minify: true,
    width: 320,
    height: 480
  });
});


// Compile templates to html
gulp.task('compile', () => {
    nunjucksRender.nunjucks.configure(['./app/views', './app/modules'], {watch: false});
    return gulp.src('./app/views/**/[^_]*.html')
      .pipe(nunjucksRender())
      .pipe(gulp.dest('./dist'));
});


// Precompile templates to js for rendering in the browser
gulp.task('precompile', () => {
  return gulp.src(['./app/templates/**/*.html', './app/modules/**/*.html'])
    .pipe(nunjucks())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./dist/assets/js'));
});


// Move fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['./app/assets/fonts/*'])
    .pipe(gulp.dest('./dist/assets/fonts'));
});


// Watch templates
gulp.task('html-watch', ['compile', 'precompile'], browserSync.reload);

// Static server
// @TODO fix sha error and set https: true,
gulp.task('browser-sync', () => {
  browserSync.init({
      logPrefix: 'Ando',
      browser: false,
      server: {
        baseDir: ['./app', './dist', './', './node_modules/@casper']
      },
      middleware: function (req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
      }
    });


  gulp.watch(['app/assets/js/**/*.js', 'app/dist/**/*.js' ], browserSync.reload);
  gulp.watch(['./app/assets/scss/**/*.scss', './app/modules/**/*.scss', './node_modules/@casper/nightshade-styles/**/*.scss' ], ['sass']);
  gulp.watch(['./app/views/**/*.html', './app/modules/**/*.html', './app/templates/**/*.html'], ['html-watch']);
    // gulp.watch(['test/**'], ['test']);

});


//Sassdoc task
gulp.task('sassdoc', () => {
  return gulp.src(['app/**/*.scss', 'app/modules/**/*.scss', './node_modules/nightshade-styles/**/*.scss'])
  .pipe(sassdoc({
      dest: './dist/sassdoc'
  }));
});

// clean tasks
// @@@ TODO: tasks to remove generated files (Dist)


// Start task (default gulp)
gulp.task('default', ['compile', 'precompile', 'fonts', 'sass', 'sassdoc', 'browser-sync']);


// Build task
gulp.task('build', ['critical']);

