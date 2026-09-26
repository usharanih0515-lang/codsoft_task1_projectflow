const mongoose = require('mongoose')
const User = require('./backend/models/User')
const Project = require('./backend/models/Project')
const Task = require('./backend/models/Task')

async function runTest() {
  await mongoose.connect('mongodb://127.0.0.1:27017/projectflow')
  
  // Clear previous test data
  await User.deleteMany({ email: { $in: ['usera@test.com', 'userb@test.com'] } })
  
  // Register User A
  const userA = await User.create({ name: 'User A', email: 'usera@test.com', password: 'password123' })
  // Register User B
  const userB = await User.create({ name: 'User B', email: 'userb@test.com', password: 'password123' })
  
  // Create a project as User A, adding User B as a member
  const project = await Project.create({
    name: 'Test Project',
    owner: userA._id,
    members: [userA._id, userB._id]
  })
  
  // Create a task as User A, assigned to User B
  const task = await Task.create({
    title: 'Test Assignment Task',
    project: project._id,
    assignedTo: userB._id
  })
  
  // Fetch task from DB to confirm
  const fetchedTask = await Task.findById(task._id).populate('assignedTo')
  
  console.log('Task Title:', fetchedTask.title)
  console.log('Assignee Name:', fetchedTask.assignedTo.name)
  console.log('Assignee ID in DB:', fetchedTask.assignedTo._id.toString())
  console.log('Expected Assignee ID:', userB._id.toString())
  
  if (fetchedTask.assignedTo._id.toString() === userB._id.toString()) {
    console.log('SUCCESS: Task assignment persisted correctly in local MongoDB.')
  } else {
    console.log('FAILED: Task assignment did not persist correctly.')
  }
  
  await mongoose.disconnect()
}

runTest().catch(console.error)
