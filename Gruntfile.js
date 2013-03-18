module.exports = function (grunt) {
  'use strict';
  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig ({
    // Project configuration
    // ---------------------

    // specify an alternate install location for Bower
    bower:   {
      dir:'app/components'
    },

    // Coffee to JS compilation
    coffee:  {
      compile:{
        files:  {
          'temp/scripts/*.js':'app/scripts/**/*.coffee'
        },
        options:{
          basePath:'app/scripts'
        }
      }
    },

    // compile .scss/.sass to .css using Compass
    compass: {
      dist:{
        // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
        options:{
          css_dir:        'temp/styles',
          sass_dir:       'app/styles',
          images_dir:     'app/images',
          javascripts_dir:'temp/scripts',
          force:          true
        }
      }
    },

    // generate application cache manifest
    manifest:{
      dest:''
    },

    // headless testing through PhantomJS
    jasmine: {
      all:['http://localhost:3333/index.html']
    },

    // default watch configuration
    watch:   {
      // coffee: {
      //   files: 'app/scripts/**/*.coffee',
      //   tasks: 'coffee reload'
      // },
      compass:{
        files:[
          'app/styles/**/*.{scss,sass}'
        ],
        tasks:'compass reload'
      },
      reload: {
        files:[
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/images/**/*',
          'test/*.js',
          'test/json/*.js',
          'test/spec/*.js',
          'test/spec/integration/*.js'

        ],
        tasks:'reload'
      }
    },

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint:    {
      files:[
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'spec/**/*.js'
      ]
    },

    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    jshint:  {
      options:{
        curly:  true,
        eqeqeq: true,
        immed:  true,
        latedef:true,
        newcap: true,
        noarg:  true,
        sub:    true,
        undef:  true,
        boss:   true,
        eqnull: true,
        browser:true
      },
      globals:{
        jQuery:true
      }
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: 'temp',
    // final build output
    output:  'dist',

    mkdirs:          {
      staging:'app/'
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    css:             {
      'styles/main.css':['styles/**/*.css']
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev:             {
      js: 'scripts/**/*.js',
      css:'styles/**/*.css',
      img:'images/**'
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler':{
      html:'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin:          {
      html:['**/*.html'],
      css: ['**/*.css']
    },

    // HTML minification
    html:            {
      files:['**/*.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img:             {
      dist:'<config:rev.img>'
    },

    // rjs configuration. You don't necessarily need to specify the typical
    // `path` configuration, the rjs task will parse these values from your
    // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
    //
    // name / out / mainConfig file should be used. You can let it blank if
    // you're using usemin-handler to parse rjs config from markup (default
    // setup)
    rjs:             {
      // no minification, is done by the min task
      optimize:'none',
      baseUrl: './scripts',
      wrap:    true,
      name:    'main'
    },

    // While Yeoman handles concat/min when using
    // usemin blocks, you can still use them manually
    concat:          {
      dist:''
    },

    min:{
      dist:''
    },
    server: {
      port: 3331,
      base: 'app'
    }

  });

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask ('test', 'server:phantom jasmine');
  //add the split task
  grunt.registerTask ('splitjson', function () {
    grunt.file.recurse('test/json', function(absPath,root,sub,file){

      if (absPath.substr(-4) === 'json'){
        var json = grunt.file.readJSON(absPath), oldFilename = file.slice(0,-5);
          for (var stageNo in json){
            if (json[stageNo].description)
              grunt.file.write(root+ '/' + oldFilename + '_' + stageNo + '.json', JSON.stringify(json[stageNo]))
          }

      }
    })

  });


  grunt.registerTask ('splitjson', function () {
    grunt.file.recurse('test/json', function(filePath,root,sub,fileName){

      if (fileName.substr(-4) === 'json'){
        var json = grunt.file.readJSON(filePath), oldFilename = fileName.slice(0,-5);
        for (var stageNum in json){
          if (json[stageNum].stage){
            json[stageNum].stageNum = parseFloat(stageNum);

            var newFilename = root+   '/' + oldFilename + '/' + stageNum + '.json';
            grunt.log.writeln('Splitting to ' + newFilename);
            for(var stepNum in json[stageNum].steps){
              json[stageNum].steps[stepNum].stepNum = parseFloat(stepNum);
            };
            grunt.file.write(newFilename, JSON.stringify(json[stageNo], undefined, 2));
          }
        }
      }
    })
  });

  /*
   * create a new task 'dev', will point server to index.html in 'dev' folder
   */


  grunt.registerTask('dev', 'Start a development web server.', function() {

    var path = require('path'),
      connect = require('connect'),
      port = grunt.config('server.port') || 8000,
      base = path.resolve(grunt.config('server.base') || '.'),
      middleware = [
        //serve the app folder
        connect.static('dev'),
        //serve the app folder
        connect.static('app'),
        //serve test data
        connect.static('test'),
        connect.static('node_modules/yeoman/tasks/livereload')

      ];


    // If --debug was specified, enable logging.
    if (grunt.option('debug')) {
      connect.logger.format('grunt', ('[D] server :method :url :status ' +
          ':res[content-length] - :response-time ms').magenta);
      middleware.unshift(connect.logger('grunt'));
    }

    // Start server.
    grunt.log.writeln('Starting development web server on port ' + port + '.');
    connect.apply(null, middleware).listen(port);
    grunt.task.run ('splitjson','watch');
  });


  /*
   * end of command line workflow control
   */


};
