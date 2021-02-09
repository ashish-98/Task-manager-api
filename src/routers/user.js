const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken() 
    res.status(201).send({user, token})
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findbyCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body) 
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValid = updates.every((update) => allowedUpdates.includes(update))
  if(!isValid) {
    return res.status(400).send({error: 'Invalid updates!'})
  }

  // const _id = req.user._id
  try {
    // const user = await User.findById(_id)
    // console.log(req)
    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()

    //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

    res.send(req.user)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  // const _id = req.user._id
  try {
    // const user = await User.findByIdAndDelete(_id)
    // if(!user) {
    // return res.status(404).send()
    // }
    await req.user.remove()
    sendCancellationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (error) {
    res.status(500).send(error)
  }
})

const upload = multer({
  limits: { 
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be an Image'))
    }
    cb(undefined, true)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

  const buffer = await sharp(req.file.buffer).resize({ width: 250, heigth: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.status(200).send(user.avatar)
  } catch (error) {
    res.status(404).send()
  }
})

module.exports = router