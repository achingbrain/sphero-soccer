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
                port: 8081,
                hostname: "0.0.0.0",
                livereload: true
            }
        }
    },
    browserify: {
      dist: {
        files: {
          'public/sphero.js': ['client/**/*.js'],
        }
      }
    },
    watch: {
      javascript: {
        files: ['client/**/*.js'],
        tasks: ['browserify'],
        options: {
                livereload: true
        }
      }
    },
    open: {
      all: {
        path: 'http://localhost:8081/index.html'
      }

    }
  });

  grunt.registerTask('default', ['browserify', 'express', 'open', 'watch']);
};
