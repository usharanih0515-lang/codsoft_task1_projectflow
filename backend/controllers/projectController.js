const mongoose = require('mongoose')
const Project = require('../models/Project')
const User = require('../models/User')

function projectAccess(userId) {
  return { $or: [{ owner: userId }, { members: userId }] }
}

function allowedProjectFields(body) {
  return Object.fromEntries(['name', 'description', 'members', 'startDate', 'deadline', 'status'].filter((field) => body[field] !== undefined).map((field) => [field, body[field]]))
}

async function getProjects(req, res, next) {
  try {
    const projects = await Project.find(projectAccess(req.user._id)).populate('owner', 'name email').populate('members', 'name email').sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) { next(error) }
}

async function createProject(req, res, next) {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Project name is required' })
    const members = Array.isArray(req.body.members) ? [...new Set(req.body.members.map(String))] : []
    if (members.some((id) => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: 'Every member must be a valid user id' })
    if (members.length && (await User.countDocuments({ _id: { $in: members } })) !== members.length) return res.status(400).json({ message: 'One or more members do not exist' })
    const project = await Project.create({ ...allowedProjectFields(req.body), name: name.trim(), owner: req.user._id, members: [...new Set([req.user._id.toString(), ...members])] })
    res.status(201).json(await project.populate('owner members', 'name email'))
  } catch (error) { next(error) }
}

async function getProject(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, ...projectAccess(req.user._id) }).populate('owner', 'name email').populate('members', 'name email')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (error) { next(error) }
}

async function updateProject(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found or you are not the owner' })
    const updates = allowedProjectFields(req.body)
    if (updates.name !== undefined && !updates.name.trim()) return res.status(400).json({ message: 'Project name cannot be empty' })
    if (updates.members !== undefined) {
      if (!Array.isArray(updates.members) || updates.members.some((id) => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: 'Members must be an array of valid user ids' })
      updates.members = [...new Set([req.user._id.toString(), ...updates.members.map(String)])]
    }
    Object.assign(project, updates)
    await project.save()
    res.json(await project.populate('owner members', 'name email'))
  } catch (error) { next(error) }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found or you are not the owner' })
    res.json({ message: 'Project deleted successfully' })
  } catch (error) { next(error) }
}

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject }
