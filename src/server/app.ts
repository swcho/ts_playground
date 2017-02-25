
import * as express from 'express';

const app = express();

app.get('/', function(req, res) {
    res.send('Hello world');
});

// TODO: Serve client static resource

app.listen(3000, function() {
    console.log('server started');
});
