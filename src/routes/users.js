const express = require('express')
const User = require('../models/user')
const Exercise = require('../models/exercise')

const router = express.Router()

router.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.json(err))
})

router.post('/', async (req, res) => {

    const findUser = await User.findOne({username: req.body.username})
    if (findUser) return res.json(findUser)

    const user = new User({
        username: req.body.username
    });

    user.save()
        .then(savedUSer => res.json(savedUSer))
        .catch(err => res.json(err))
})

router.post('/:_id/exercises', async (req, res) => {

    const userId = req.params['_id']
    const foundUser = await User.findById(userId)


    if(!foundUser) {
        return res.json({
            message: "No user exists fot that id"
        })
    }

    if (isNaN(req.body.duration) || (req.body.duration < 0)) {
        return res.json("Duration must be a number greater than 0.")
    }

    if(req.body.date) {
        if (!/\d{4}-\d{2}-\d{2}/.test(req.body.date)) {
            return res.json("Date format must be yyyy-mm-dd")
        }
        req.body.date = new Date(req.body.date)
    } else {
        req.body.date = new Date()
    }

    await Exercise.create({
        username: foundUser.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
        userId: userId
    })

    res.json({
        _id: userId,
        username: foundUser.username,
        date: req.body.date.toDateString(),
        duration: parseInt(req.body.duration),
        description: req.body.description
    })
});

router.get('/:_id/logs', async (req, res) => {

    const fromDate = req.query.from ? new Date(req.query.from) : null
    const toDate = req.query.to ? new Date(req.query.to) : null

    const foundUser = await User.findById(req.params._id)

    if(!foundUser) {
        return res.json({
            message: "No user exists fot that id"
        })
    }

    const filters = { userId: req.params._id }

    if (fromDate && !toDate) filters.date = { $gte: fromDate }
    if (toDate && !fromDate) filters.date = { $lte: toDate }
    if (toDate && fromDate) filters.date = { $gte: fromDate, $lte: toDate }

    Exercise.find(filters, async (err, exercises) => {

        if (!exercises) return res.json({ message: 'There are no exercises for the user.'})

        const findUser = await User.findById(req.params._id)

        const limit = req.query.limit ? parseInt(req.query.limit) : exercises.length
        const username = findUser.username
        const userId = findUser._id

        res.json(createResponseObject(userId, username, exercises, limit))
    })
})

function createResponseObject(userId, username, exercises, limit) {
    return {
        _id: userId,
        username: username,
        count: limit,
        log: exercises.slice(0, limit).map(exercise => {
            const { username, _id, userId, ...exerciseObject } = exercise.toObject();
            exerciseObject.date = exerciseObject.date.toDateString()
            return exerciseObject;
        })
    };
}

module.exports = router;
