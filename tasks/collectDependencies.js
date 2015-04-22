/*
 * grunt-collect-dependencies
 * https://github.com/ukupat/grunt-collect-dependencies
 *
 * Copyright (c) 2015 Uku Pattak
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask('collectDependencies', 'Collect AngularJS dependencies between Modules', function() {
    var ret = [];
    var app = grunt.option('app');

    function startWith(app) {
      var file = grunt.file.read('src/apps/' + app + '/App.js');
      var hello = getListOfModulesFrom(file);

      for (var i = 0; i < hello.length; i ++) {
        recursiveShit(hello[i]);
      }
    }

    function recursiveShit(module) {
      if (ret.indexOf(module) !== -1) {
        grunt.log.writeln(module);
        return;
      }
      var subModules = getListOfModulesFrom(getFileContent(module));

      for (var i = 0; i < subModules.length; i ++) {
        recursiveShit(subModules[i]);
      }
      if ((module + '/').indexOf(app + '/') === -1) {
        ret.push(module);
      }
    }

    function getFileContent(module) {
      if (!grunt.file.exists('src/modules/' + module + '/Module.js')) {
        return grunt.file.read('src/apps/' + module + '/Module.js');
      } else {
        return grunt.file.read('src/modules/' + module + '/Module.js');
      }
    }

    function getListOfModulesFrom(file) {
      var parsedFile = file.replace(/\s+/g, '').match(/\.module\([^,]+,\[(('[^\)]*'),*)*]/)[1];

      if (!parsedFile) {
        return [];
      }
      parsedFile = parsedFile.match(/'([\w\.]*)'*/gi);
      var modules = [];

      for (var i = 0; i < parsedFile.length; i ++) {
        if (/tw\./.test(parsedFile[i])) {
          modules.push(parsedFile[i].replace(/'/g, '').replace('tw.', '').replace(/\./g, '/'));
        }
      }
      return modules;
    }

    function getFilePath(module) {
      if (grunt.file.exists('src/modules/' + module + '/Module.js')) {
        return 'src/modules/' + module + '/';
      } else {
        return 'src/apps/' + module + '/';
      }
    }

    function clean() {
      ret.sort();

      for (var i = 0; i < ret.length; i ++) {
        if (i !== 0 && (ret[i] + '/').indexOf(ret[i - 1] + '/') !== -1) {
          ret.splice(i, 1);
          i --;
        }
      }
    }

    function constructDependenciesList() {
      var dependencies = {js: [], html: []};

      for (var i = 0; i < ret.length; i ++) {
        dependencies.js.push(getFilePath(ret[i]) + '**/Module.js');
        dependencies.html.push(getFilePath(ret[i]) + '**/*.html');
      }
      for (i = 0; i < ret.length; i ++) {
        dependencies.js.push(getFilePath(ret[i]) + '**/*.js');
      }
      return dependencies;
    }

    function init() {
      startWith(app);
      clean();

      var dependencies = constructDependenciesList();

      for (var i = 0; i < dependencies.js.length; i ++) {
        grunt.log.writeln('"' + dependencies.js[i] + '",');
      }
      for (i = 0; i < dependencies.html.length; i ++) {
        grunt.log.writeln('"' + dependencies.html[i] + '",');
      }
    }

    init();
  });
};
