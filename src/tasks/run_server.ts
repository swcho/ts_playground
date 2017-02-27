
module.exports = (grunt: IGrunt) => {
    grunt.registerMultiTask('run_server', function() {
        const cb = this.async();
        const target = this.target;
        const {
            path
        } = this.data;
        process.env['CLIENT_ROOT'] = 'out/client';
        process.env['USE_BROWSER_SYNC'] = 'true';
        require(path + '/app.js');
    });
}
