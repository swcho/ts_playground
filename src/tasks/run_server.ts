
module.exports = (grunt: IGrunt) => {
    grunt.registerMultiTask('run_server', function() {
        const cb = this.async();
        const target = this.target;
        const {
            path
        } = this.data;
        require(path + '/app.js');
    });
}
