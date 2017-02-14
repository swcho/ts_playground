
import { IGrunt } from 'grunt';

module.exports = (grunt: IGrunt) => {

    require('./tasks/build')(grunt);

    grunt.initConfig({

    });

    grunt.registerTask('default', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok();
    });
}