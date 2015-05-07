'use strict';

var grunt = require('grunt');

exports.test = {
	setUp: function (done) {
		done();
	},
	defaultOptions: function (test) {
		test.expect(1);

		var actual = grunt.file.read('tmp/default-option-dependencies.json');
		var expected = grunt.file.read('test/expected/default-option-dependencies.json');

		test.equal(actual, expected, 'should describe what the default behavior is');

		test.done();
	}
};