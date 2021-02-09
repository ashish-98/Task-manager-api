const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { json } = require('express')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
  
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

//GET /tasks?Completed=false/true
//GET /tasks?limit=10&skip=0
//GET /tasks?Sortby=createdAt:asc/:desc

router.get('/tasks', auth, async (req, res) => {
  const match = {} 
  const sort = {}
  if(req.query.Completed) {
    match.Completed = req.query.Completed === 'true'
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // const tasks = await Task.find({owner: req.user._id})
    await req.user.populate({
      path: 'tasks',
      match,
      sort,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip)
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if(!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['Description', 'Completed']
  const isValid = updates.every((update) => allowedUpdates.includes(update))
  if(!isValid) {
    return res.status(400).send({error: 'Invalid updates'})
  }
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

    if(!task) {
      return res.status(404).send()
    }
    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOneAndDelete({_id, owner: req.user._id})

    if(!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router