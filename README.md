# grunt-collect-dependencies

> Collect AngularJS app dependencies into a JSON file

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-collect-dependencies --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-collect-dependencies');
```

## The "collectDependencies" task

### Options

#### options.appPath
Type: `String`

The app path where to find your application AngularJS module.

#### options.appFile
Type: `String`

The app file name.

#### options.appName
Type: `String`

The app module name.

#### options.src
Type: `String`

Source path where to start looking dependencies.

#### options.dist
Type: `String`

Path where to write the dependency file.

#### options.removePrefix
Type: `String`
Default: `''` 

Remove prefix from module names.

### Usage Examples

```js
grunt.initConfig({
  collectDependencies: {
    options: {
      appPath: 'src/facebook/',
      appFile: 'App.js',
      appName: 'Facebook',
      src: 'src/',
      dist: 'tmp/facebook-dependencies.json',
      removePrefix: 'fb.'
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2015-05-08 v1.0.0 Initial release
