const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const database = require('./src/database');

const userRouter = require('./src/routes/users');

app.use(cors())
app.use(express.static('public'))
app.use('/user', userRouter);



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
