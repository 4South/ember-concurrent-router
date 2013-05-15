'use strict'

module.exports = (grunt) ->
  
  grunt.initConfig
  
    minispade:
      options:
        renameRequire: true
        useStrict: false
        prefixToRemove: 'public/js/'
      files:
        src: ['public/js/**/*.js']
        dest: 'public/dist/appjs.js'

    sass:
      dist:
        options:
          trace: true
          style: 'expanded'
        files:
          'public/dist/appsass.css': 'public/sass/app.sass'

    ember_templates:
      compile:
        options:
          templateName: (sourceFile) ->
            return sourceFile.replace(/public\/handlebars\//,'')
        files:
          "public/dist/apptemplates.js": "public/handlebars/**/*.handlebars"
    

  grunt.loadNpmTasks('grunt-contrib-livereload')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-ember-templates')
  grunt.loadNpmTasks('grunt-regarde')
  grunt.loadNpmTasks('grunt-minispade')

  grunt.registerTask('default', [
                                        'livereload-start',
                                        'ember_templates',
                                        'sass',
                                        'minispade'
                                        'regarde'             ])
