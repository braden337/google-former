require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/form', form);

async function form(req, res) {
  let form = req.body;

  let response = await fetch(form.url);
  let body = await response.text();

  res.type('txt');
  res.send(body);
}

let listener = app.listen(process.env.PORT, function () {
  console.log('🖥 Listening on port', listener.address().port);
});