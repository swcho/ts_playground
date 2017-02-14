
import { IGrunt } from 'grunt';
import * as build from './tasks/build';

export default (grunt: IGrunt) => {

    build.default(grunt);

    grunt.initConfig({

    });

    grunt.registerTask('default', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok();
    });
}