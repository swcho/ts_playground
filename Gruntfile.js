"use strict";
var build = require("./tasks/build");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (grunt) {
    build.default(grunt);
    grunt.initConfig({});
    grunt.registerTask('default', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok();
    });
};
