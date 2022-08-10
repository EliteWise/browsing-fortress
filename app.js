const express = require('express')
const mongoose = require('mongoose');
const Url = require('./models/url');

const app = express()
const port = 3000

const dbURI = 'mongodb://localhost:27017/urls';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => app.listen(port))
.catch((err) => console.log(JSON.stringify(err)));

app.use(express.json()) // app.use(express.text())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/testReq', function(req, res, next){
    console.log(req.body) // Your data from the extension
});

app.post('/check-url', (req, res) => {
  Url.find({ url: req.body.url })
  .then(doc => {
    console.log(doc[0]);
    doc.length === 0 ? res.status(204).json(null) : res.status(200).json({ url: doc[0].url, isSafe: doc[0].safe });
  });
});

app.post('/add-url', (req, res) => {
  const url = new Url({
    url: req.body.url,
    safe: req.body.isSafe,
    threatType: req.body.threatType
  });

  url.save()
    .then((result) => {
      console.log("Status Code: " + res.statusCode + " \n" + "Result: " + JSON.stringify(result));
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/all-urls/:safe', (req, res) => {
  Url.find(req.params.safe === 'all' ? null : { safe: req.params.safe })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get-url/:url/:safe', (req, res) => {
  Url.find({ url: req.params.url }, { safe: req.params.safe })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
});