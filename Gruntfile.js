/*
 * grunt-collect-dependencies
 * https://github.com/ukupat/grunt-collect-dependencies
 *
 * Copyright (c) 2015 Uku Pattak
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {

  grunt.initConfig({
    collect_dependencies: {
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      },
      custom_options: {
        options: {
          separator: ': ',
          punctuation: ' !!!'
        },
        files: {
          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      }
    }
  });

  grunt.loadTasks('tasks');
};
