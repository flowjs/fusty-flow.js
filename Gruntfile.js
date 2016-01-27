var clone = require('clone');
var webpack = require('webpack');

module.exports = function (grunt) {

  // Project configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    webpack: {
      standalone: clone(require('./webpack.base.config')),
      lib: clone(require('./webpack.base.config')),
      libMin: clone(require('./webpack.base.config'))
    }
  };

  //////////////////////////////////////
  // Standalone webpack overrides
  //////////////////////////////////////
  config.webpack.standalone.output.filename = 'dist/fusty-flow-standalone.js';

  //////////////////////////////////////
  // Library webpack overrides
  //////////////////////////////////////
  config.webpack.lib.output.filename = 'dist/fusty-flow.js';

  config.webpack.lib.externals = [
    {
      'flow.js': {
        'commonjs': 'flow.js',
        'commonjs2': 'flow.js',
        'amd': 'flow',
        'root': 'Flow'
      }
    }
  ];

  /////////////////////////////////////
  //Minified library overrides
  /////////////////////////////////////
  config.webpack.libMin.output.filename = 'dist/fusty-flow.min.js';

  config.webpack.libMin.externals = config.webpack.lib.externals;

  config.webpack.libMin.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      sequences: true,  // join consecutive statemets with the “comma operator”
      properties: true,  // optimize property access: a["foo"] → a.foo
      dead_code: true,  // discard unreachable code
      drop_debugger: true,  // discard “debugger” statements
      unsafe: false, // some unsafe optimizations (see below)
      conditionals: true,  // optimize if-s and conditional expressions
      comparisons: true,  // optimize comparisons
      evaluate: true,  // evaluate constant expressions
      booleans: true,  // optimize boolean expressions
      loops: true,  // optimize loops
      unused: true,  // drop unused variables/functions
      hoist_funs: true,  // hoist function declarations
      hoist_vars: false, // hoist variable declarations
      if_return: true,  // optimize if-s followed by return/continue
      join_vars: true,  // join var declarations
      cascade: true,  // try to cascade `right` into `left` in sequences
      side_effects: true,  // drop side-effect-free statements
      warnings: true,  // warn about potentially dangerous optimizations/code
      global_defs: {}     // global definitions
    }
  }));

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-webpack');

  // Default task(s).
  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', ['webpack']);
};