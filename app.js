const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const usersRoute = require('./src/routers/users')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

//ROUTER
app.use('/users', usersRoute)

//Basic Route
app.get('/', (req, res) => {
  res.send('Timestamper is running...')
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Timestamper is running on port ${PORT} ...`)
})

module.exports = app
