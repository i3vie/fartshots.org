// -- dont touch zone

import express from 'express';
const app = express();
const port = 3000;
import { router as webhookRouter } from './webhook_dont_touch/webhook.ts';

app.use('/webhook', webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('trust proxy', 2); // trust first 2 proxies, since we're behind cloudflare and then our own nginx proxy

app.use(express.static('public'));

// -- do touch zone

app.get('/', (req, res) => {
    const nodeVersion = process.version;
    res.render('index', { host: req.ip, nodeVersion });
});

import exampleRouter from "./routers/example.ts";
app.use('/example', exampleRouter);
// Take a look at routers/example.js for an example of how to make a new router
// You can make as many routers as you want, just put them in the routers folder and add a line here to use them
// Any routes defined in the router will be prefixed with the first argument of app.use, in this case '/example'
// so if you define a route '/test' in the example router, it will be accessible at '/example/test' on the site
// I hope this makes sense

import i3vieRouter from "./routers/i3vie/router.ts";
app.use('/i3vie', i3vieRouter);

// If you use a DB or something that needs an async init step, add it here
import { initDB } from './routers/i3vie/db.ts';
import { startSessionCleanupInterval } from './routers/i3vie/session.ts';

async function start() {
    await initDB();
    await startSessionCleanupInterval();

    // Do your init step here, then start the server
    
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
}

start();
