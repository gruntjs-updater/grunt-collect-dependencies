/*
 * grunt-collect-dependencies
 * https://github.com/ukupat/grunt-collect-dependencies
 *
 * Copyright (c) 2015 Uku Pattak
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var findup = require('findup-sync');
	var minimatch = require('minimatch');

	var options, appName;
	var modules = [];

	function collectModuleDependenciesFor(app) {
		var appContent = grunt.file.read(getAppFullPath(app));
		var appModules = getListOfModulesFrom(appContent);

		for (var i = 0; i < appModules.length; i++) {
			recursiveMagic(appModules[i]);
		}
		appName = getAppName(appContent);

		optimiseModulesList();
	}

	function getAppFullPath(app) {
		return path.join(options.basePath, grunt.config.process(app), 'App.js')
	}

	function getAppName(content) {
		return content.match(/\.module\('([\w|.]+)'/i)[1].replace(options.removePrefix, '');
	}

	function getListOfModulesFrom(content) {
		if (!content) {
			return false;
		}
		var parsedModules = parseModulesFrom(content);

		if (parsedModules) {
			var modules = [];

			for (var i = 0; i < parsedModules.length; i++) {
				modules.push(parsedModules[i].replace(/'/g, '').replace(options.removePrefix, '').replace(/\./g, '/'));
			}
			return modules;
		}
		return [];
	}

	function parseModulesFrom(content) {
		var parsedModules = content.replace(/\s+/g, '').match(/\.module\([^,]+,\[(('[^\)]*'),*)*]/i)[1];

		if (!parsedModules) {
			return;
		}
		return parsedModules.match(/'([\w\.]*)'*/gi);
	}

	function recursiveMagic(module) {
		if (modules.indexOf(module) !== -1) {
			return;
		}
		var subModules = getListOfModulesFrom(getContent(module));

		if (!subModules) {
			return;
		}
		for (var i = 0; i < subModules.length; i++) {
			recursiveMagic(subModules[i]);
		}
		modules.push(module);
	}

	function getContent(module) {
		var modulePath = findup(path.join(options.basePath, options.src) + '/**/' + path.join(module, 'Module.js'), {nocase: true});

		if (modulePath === null) {
			grunt.log.debug('Module "' + module + '" is missing');

			return;
		}
		return grunt.file.read(modulePath);
	}

	function optimiseModulesList() {
		modules.sort();

		for (var i = 0; i < modules.length; i++) {
			if ((modules[i] + '/').indexOf(modules[i - 1] + '/') !== -1 || modules[i].indexOf(appName) !== -1) {
				modules.splice(i, 1);
				i--;
			}
		}
	}

	function dependenciesList() {
		var dependencies = {js: [], html: []};

		for (var i = 0; i < modules.length; i++) {
			dependencies.js.push(getPath(modules[i]) + '**/Module.js');
			dependencies.html.push(getPath(modules[i]) + '**/*.html');
		}
		for (i = 0; i < modules.length; i++) {
			dependencies.js.push(getPath(modules[i]) + '**/*.js');
		}
		dependencies = addAppFilesTo(dependencies);

		return dependencies;
	}

	function getPath(module) {
		var fullPath = findup(path.join(options.basePath, options.src) + '/**/' + path.join(module, 'Module.js'), {nocase: true});
		var modulePath = fullPath.split(options.basePath)[1].replace('Module.js', '').substring(1);

		return path.join(options.baseUrl, modulePath);
	}

	function addAppFilesTo(dependencies) {
		dependencies.js.push(path.join(options.appPath, 'App.js'));
		dependencies.js.push(path.join(options.appPath, '**/Module.js'));
		dependencies.js.push(path.join(options.appPath, '**/*.js'));
		dependencies.html.push(path.join(options.appPath, '**/*.html'));

		return dependencies;
	}

	function write(dependencies) {
		grunt.file.write(grunt.config.process(options.dest), JSON.stringify(dependencies, null, 2));
	}

	grunt.registerMultiTask('collectDependencies', 'Collect AngularJS app dependencies into a JSON file', function () {
		grunt.log.debug('Starting task "collectDependencies"...');

		options = this.options({
			basePath: '',
			removePrefix: ''
		});
		options.basePath = grunt.config.process(options.basePath);
		options.src = grunt.config.process(options.src);
		options.appPath = grunt.config.process(options.appPath);

		collectModuleDependenciesFor(options.appPath);

		grunt.log.debug('Depending on modules: ' + modules);

		write(dependenciesList());
	});
};
