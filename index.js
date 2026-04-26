const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // middleware to parse JSON request bodies
app.set('view engine', 'ejs'); // set EJS as the view engine
app.set('trust proxy', true); // do not touch this, it is required to get the correct client IP address when behind a proxy

/// this will render views/index.ejs and pass the client's IP address as the "host" variable
/// when you access the root URL (/) of the server
app.get('/', (req, res) => {
  const host = req.ip;
  res.render('index', { host });
});

/// simple route that responds with "Hello, [name]!" when you access /hello/:name
app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

/// log request body for POST requests to /log and respond with "Logged!"
app.post('/log', (req, res) => {
  console.log(req.body);
  res.send('Logged!');
});


app.listen(port, () => {
  console.log(`listening on port ${port}`);
});