const express = require('express')
const mongoose = require('mongoose');
const Url = require('./models/url');
const config = require("./credentials.json");

const app = express()
const port = 3000

// Local Only - Development purpose: 'mongodb://127.0.0.1:27017/urls'
const dbURI = `mongodb://Elite:${config.mongodb_password}@127.0.0.1:27017/urls`;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => app.listen(port, "0.0.0.0"))
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
    console.log(doc);
    doc.length === 0 ? res.status(204).json(null) : res.status(200).json({ url: doc[0].url, isSafe: doc[0].safe });
  })
  .catch((err) => {
      console.log(err);
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

app.get('/listUnsafeUrls', (req, res) => {
  Url.find({ safe: false }).select('-_id url safe')
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/countUrls', (req, res) => {
  Url.aggregate([{
    $group: 
    {
        _id: "$safe",
        count: { $sum: 1 }
    }
  }])
    .then((result) => {
      res.status(200).json({safe: result[1].count, unsafe: result[0].count});
    })
    .catch((err) => {
      console.log(err);
    });
});