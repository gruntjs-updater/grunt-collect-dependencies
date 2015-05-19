/*
 * grunt-collect-dependencies
 * https://github.com/ukupat/grunt-collect-dependencies
 *
 * Copyright (c) 2015 Uku Pattak
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
	'use strict';

	grunt.registerMultiTask('collectDependencies', 'Collect AngularJS app dependencies into a JSON file', function () {
		modules = [];
		options = this.options({
			basePath: '',
			baseUrl: '',
			removePrefix: ''
		});
		formatOptionPaths();
		collectModuleDependenciesFor(options.appPath);

		grunt.log.debug('App "' + options.appName + '" dependes on modules: ' + modules);

		write(dependenciesList());
	});

	var path = require('path');
	var findup = require('findup-sync');

	var options;
	var modules = [];

	function formatOptionPaths() {
		options.src = path.join(options.src);
		options.dist = path.join(options.dist);
	}

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
			dependencies.js.push(path.join(getPath(modules[i]) + '**/Module.js').replace(/\\/g, '/'));
			dependencies.html.push(path.join(getPath(modules[i]) + '**/*.html').replace(/\\/g, '/'));
		}
		for (i = 0; i < modules.length; i++) {
			dependencies.js.push(path.join(getPath(modules[i]) + '**/*.js').replace(/\\/g, '/'));
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
		var modulePath = findup(path.join(options.basePath, options.src, module, 'Module.js'), {nocase: true});

		if (modulePath === null) {
			return findup(path.join(options.basePath, options.src, '/*/', module, 'Module.js'), {nocase: true});
		}
		return modulePath;
	}

	function addAppFilesTo(dependencies) {
		dependencies.js.push(path.join(options.appPath, options.appFile).replace(/\\/g, '/'));
		dependencies.js.push(path.join(options.appPath, '**/Module.js').replace(/\\/g, '/'));
		dependencies.js.push(path.join(options.appPath, '**/*.js').replace(/\\/g, '/'));
		dependencies.html.push(path.join(options.appPath, '**/*.html').replace(/\\/g, '/'));

		return dependencies;
	}

	function write(dependencies) {
		grunt.file.write(grunt.config.process(options.dist), JSON.stringify(dependencies, null, 2));
	}
};