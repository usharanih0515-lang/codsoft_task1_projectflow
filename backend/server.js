require('dotenv').config()

const cors = require('cors')
const express = require('express')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:5173', 'https://usharanih0515-lang.github.io'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ProjectFlow API is running'
  })
})
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ProjectFlow API is running' })
})
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use(notFound)
app.use(errorHandler)

connectDB()
app.listen(port, () => console.log(`ProjectFlow API listening on port ${port}`))

module.exports = app


