
import * as express from 'express';
import * as browserSync from 'browser-sync';

const CLIENT_ROOT = process.env['CLIENT_ROOT'] || '../client';
const PORT = process.env['PORT'] || '3000';
const USE_BROWSER_SYNC = process.env['USE_BROWSER_SYNC'];

if (USE_BROWSER_SYNC) {
    const bs = browserSync.create();
    bs.init({
        server: CLIENT_ROOT,
        files: CLIENT_ROOT + '/**/*',
        open: false
    });
} else {
    const app = express();
    app.use(express.static(CLIENT_ROOT));
    app.listen(PORT, function() {
        console.log(`server started on ${PORT}`);
    });
}

