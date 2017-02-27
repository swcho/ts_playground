
module.exports = (grunt: IGrunt) => {
    grunt.registerMultiTask('run_server', function() {
        const cb = this.async();
        const target = this.target;
        const {
            path
        } = this.data;
        process.env['CLIENT_ROOT'] = 'out/client';
        require(path + '/app.js');
    });
}
