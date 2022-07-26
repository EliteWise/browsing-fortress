const express = require('express')
const app = express()
const port = 3000

app.use(express.text())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.post('/log', function(req, res, next){
    console.log(req.body) //Your data from the extension
});