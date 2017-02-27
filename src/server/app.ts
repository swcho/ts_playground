
import * as express from 'express';

const CLIENT_ROOT = process.env['CLIENT_ROOT'] || '../client';
const PORT = process.env['PORT'] || '3000';

const app = express();
if (CLIENT_ROOT) {
    console.log('CLIENT_ROOT', CLIENT_ROOT);
    app.use(express.static(CLIENT_ROOT));
}


app.get('/', function(req, res) {
    res.send('Hello world');
});

// TODO: Serve client static resource

app.listen(PORT, function() {
    console.log(`server started on ${PORT}`);
});
