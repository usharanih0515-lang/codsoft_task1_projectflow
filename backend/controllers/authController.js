const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt }
}

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body
    const normalizedEmail = email?.trim().toLowerCase()
    if (!name?.trim() || !normalizedEmail || !password) return res.status(400).json({ message: 'Name, email, and password are required' })
    if (!emailPattern.test(normalizedEmail)) return res.status(400).json({ message: 'Please provide a valid email address' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email is already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword })
    res.status(201).json({ user: publicUser(user), token: createToken(user._id.toString()) })
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail || !password) return res.status(400).json({ message: 'Email and password are required' })
    if (!emailPattern.test(normalizedEmail)) return res.status(400).json({ message: 'Please provide a valid email address' })

    const user = await User.findOne({ email: normalizedEmail }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' })
    res.json({ user: publicUser(user), token: createToken(user._id.toString()) })
  } catch (error) {
    next(error)
  }
}

function me(req, res) {
  res.json({ user: publicUser(req.user) })
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find({}).select('name email')
    res.json(users)
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, me, getUsers }
