const express = require('express')
const taskRouter = require('./routers/task')
const userRouter = require('./routers/user')
const env_cmd = require('env-cmd')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log('Server is up on port ' + port)
})













