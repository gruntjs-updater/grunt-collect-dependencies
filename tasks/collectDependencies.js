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

	var options;
	var modules = [];

	grunt.registerMultiTask('collectDependencies', 'Collect AngularJS app dependencies into a JSON file', function () {
		modules = [];
		options = this.options({
			basePath: '',
			baseUrl: '',
			removePrefix: ''
		});
		collectModuleDependenciesFor(options.appPath);

		grunt.log.debug('App "' + options.appName + '" dependes on modules: ' + modules);

		write(dependenciesList());
	});

	function collectModuleDependenciesFor(app) {
		var appContent = grunt.file.read(getAppFullPath(app));
		var appModules = getListOfModulesFrom(appContent);

		for (var i = 0; i < appModules.length; i++) {
			recursiveMagic(appModules[i]);
		}
		optimiseModulesList();
	}

	function getAppFullPath(app) {
		return path.join(options.basePath, app, options.appFile);
	}

	function getListOfModulesFrom(content) {
		if (!content) {
			return false;
		}
		var parsedModules = parseModulesFrom(content);

		if (parsedModules) {
			var modules = [];

			for (var i = 0; i < parsedModules.length; i ++) {
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
		var modules = parsedModules.match(/'([\w\.]*)'*/gi);

		return modules;
	}

	function recursiveMagic(module) {
		if (modules.indexOf(module) !== -1 || !module) {
			return;
		}
		var subModules = getListOfModulesFrom(getContent(module));

		if (!subModules) {
			return;
		}
		grunt.log.debug('Module "' + module + '" dependes on modules: ' + subModules);

		modules.push(module);

		for (var i = 0; i < subModules.length; i++) {
			recursiveMagic(subModules[i]);
		}
	}

	function getContent(module) {
		var modulePath = getFullPathOf(module);

		if (modulePath === null) {
			grunt.log.debug('Module "' + module + '" is missing');

			return;
		}
		return grunt.file.read(modulePath);
	}

	function optimiseModulesList() {
		modules.sort();

		for (var i = 0; i < modules.length; i++) {
			if ((modules[i] + '/').indexOf(modules[i - 1] + '/') !== -1 || modules[i].indexOf(options.appName) !== -1) {
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
		var fullPath = getFullPathOf(module);
		var modulePath = fullPath.split(options.src)[1].replace('Module.js', '');

		return path.join(options.baseUrl, options.src, modulePath);
	}

	function getFullPathOf(module) {
		return findup(path.join(options.basePath, options.src) + '/*/' + path.join(module, 'Module.js'), {nocase: true});
	}

	function addAppFilesTo(dependencies) {
		dependencies.js.push(path.join(options.appPath, options.appFile));
		dependencies.js.push(path.join(options.appPath, '**/Module.js'));
		dependencies.js.push(path.join(options.appPath, '**/*.js'));
		dependencies.html.push(path.join(options.appPath, '**/*.html'));

		return dependencies;
	}

	function write(dependencies) {
		grunt.file.write(grunt.config.process(options.dist), JSON.stringify(dependencies, null, 2));
	}
};
