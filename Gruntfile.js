/*
 * grunt-collect-dependencies
 * https://github.com/ukupat/grunt-collect-dependencies
 *
 * Copyright (c) 2015 Uku Pattak
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.loadTasks('tasks');

	grunt.initConfig({

		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		clean: {
			tests: ['tmp']
		},

		collectDependencies: {
			defaultOptions: {
				options: {
					basePath: 'test/fixtures',
					appPath: 'src/app',
					appFile: 'App.js',
					appName: 'app',
					src: ['src', 'lib'],
					baseUrl: '',
					dist: 'tmp/default-option-dependencies.json',
					removePrefix: 'hg.'
				}
			}
		},

		nodeunit: {
			tests: ['test/*Spec.js']
		}
	});

	grunt.registerTask('test', ['jshint', 'clean', 'collectDependencies', 'nodeunit']);
	grunt.registerTask('default', ['test']);
};
