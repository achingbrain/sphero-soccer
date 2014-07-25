module.exports = function(grunt) {

  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Grunt express - our webserver
    // https://github.com/blai/grunt-express
    express: {
        all: {
            options: {
                bases: ['./public'],
                port: 16000,
                hostname: "0.0.0.0",
                livereload: true,
                server: './server/index.js'
            }
        }
    },
    browserify: {
      dist: {
        files: {
          'public/index.js': ['client/main.js'],
          'public/blob_finder_worker.js': ['client/blob_finder_worker.js'],
          'public/blob_combiner_worker.js': ['client/blob_combiner_worker.js'],
          'public/pixel_data_splitter_worker.js': ['client/pixel_data_splitter_worker.js']
        }
      }
    },
    watch: {
      javascript: {
        files: ['client/**/*.js', 'client/**/*.html', 'client/**/*.css'],
        tasks: ['browserify'],
        options: {
                livereload: true
        }
      }
    },
    open: {
      all: {
        path: 'http://localhost:16000'
      }

    }
  });

  grunt.registerTask('default', ['browserify', 'express', 'open', 'watch']);
};
