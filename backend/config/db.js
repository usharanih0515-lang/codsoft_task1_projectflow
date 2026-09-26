const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  if (isConnected) return

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projectflow'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    })
    isConnected = true
    console.log('MongoDB connected successfully to local MongoDB at', uri)
  } catch (error) {
    console.error(`Local MongoDB connection failed: ${error.message}`)
    console.error('CRITICAL: Ensure your local MongoDB server is running on 127.0.0.1:27017')
    process.exit(1) // Exit explicitly to fail fast
  }
}

module.exports = connectDB
