// -- dont touch zone

const express = require('express');
const app = express();
const port = 3000;
const webhookRouter = require('./webhook_dont_touch/webhook');
app.use('/webhook', webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(express.static('public'));

// -- do touch zone

app.get('/', (req, res) => {
    const nodeVersion = process.version;
    res.render('index', { host: req.ip, nodeVersion });
});

app.use('/example', require('./routers/example'));
// Take a look at routers/example.js for an example of how to make a new router
// You can make as many routers as you want, just put them in the routers folder and add a line here to use them
// Any routes defined in the router will be prefixed with the first argument of app.use, in this case '/example'
// so if you define a route '/test' in the example router, it will be accessible at '/example/test' on the site
// I hope this makes sense

app.use('/i3vie', require('./routers/i3vie'));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});