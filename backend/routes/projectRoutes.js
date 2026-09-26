const express = require('express')
const protect = require('../middleware/authMiddleware')
const { getProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/projectController')

const router = express.Router()
router.use(protect)
router.route('/').get(getProjects).post(createProject)
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject)

module.exports = router
