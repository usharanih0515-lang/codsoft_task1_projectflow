const Task = require('../models/Task')
const Project = require('../models/Project')
const User = require('../models/User')

function projectAccess(userId) {
  return { $or: [{ owner: userId }, { members: userId }] }
}

async function accessibleProject(projectId, userId) {
  return Project.findOne({ _id: projectId, ...projectAccess(userId) })
}

function allowedTaskFields(body) {
  return Object.fromEntries(['title', 'description', 'project', 'assignedTo', 'priority', 'status', 'startDate', 'dueDate'].filter((field) => body[field] !== undefined).map((field) => [field, body[field]]))
}

const populateTask = (query) => query.populate('project', 'name owner').populate('assignedTo', 'name email')

async function getTasks(req, res, next) {
  try {
    const projects = await Project.find(projectAccess(req.user._id)).select('_id')
    const tasks = await populateTask(Task.find({ project: { $in: projects.map((project) => project._id) } }).sort({ createdAt: -1 }))
    res.json(tasks)
  } catch (error) { next(error) }
}

async function createTask(req, res, next) {
  try {
    const { title, project, assignedTo } = req.body
    if (!title?.trim() || !project || !assignedTo) return res.status(400).json({ message: 'Title, project, and assignedTo are required' })
    const projectDoc = await accessibleProject(project, req.user._id)
    if (!projectDoc) return res.status(404).json({ message: 'Project not found or inaccessible' })
    if (!(await User.exists({ _id: assignedTo }))) return res.status(400).json({ message: 'assignedTo must reference an existing user' })
    const isMember = projectDoc.members.some(id => id.toString() === assignedTo.toString()) || projectDoc.owner.toString() === assignedTo.toString()
    if (!isMember) return res.status(400).json({ message: 'Assignee must be a member of the project' })
    const task = await Task.create({ ...allowedTaskFields(req.body), title: title.trim() })
    res.status(201).json(await populateTask(Task.findById(task._id)))
  } catch (error) { next(error) }
}

async function getTask(req, res, next) {
  try {
    const task = await populateTask(Task.findById(req.params.id))
    if (!task || !(await accessibleProject(task.project._id, req.user._id))) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (error) { next(error) }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
    if (!task || !(await accessibleProject(task.project, req.user._id))) return res.status(404).json({ message: 'Task not found' })
    const updates = allowedTaskFields(req.body)
    const projectDoc = await accessibleProject(updates.project || task.project, req.user._id)
    if (updates.project !== undefined && !projectDoc) return res.status(404).json({ message: 'Project not found or inaccessible' })
    if (updates.assignedTo !== undefined) {
      if (!(await User.exists({ _id: updates.assignedTo }))) return res.status(400).json({ message: 'assignedTo must reference an existing user' })
      const isMember = projectDoc.members.some(id => id.toString() === updates.assignedTo.toString()) || projectDoc.owner.toString() === updates.assignedTo.toString()
      if (!isMember) return res.status(400).json({ message: 'Assignee must be a member of the project' })
    }
    if (updates.title !== undefined && !updates.title.trim()) return res.status(400).json({ message: 'Task title cannot be empty' })
    Object.assign(task, updates)
    await task.save()
    res.json(await populateTask(Task.findById(task._id)))
  } catch (error) { next(error) }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
    if (!task || !(await accessibleProject(task.project, req.user._id))) return res.status(404).json({ message: 'Task not found' })
    await task.deleteOne()
    res.json({ message: 'Task deleted successfully' })
  } catch (error) { next(error) }
}

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask }
