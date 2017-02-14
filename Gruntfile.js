"use strict";
module.exports = (grunt) => {
    require('./tasks/build')(grunt);
    grunt.initConfig({});
    grunt.registerTask('default', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok();
    });
};
//# sourceMappingURL=Gruntfile.js.map