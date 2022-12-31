const express = require('express')
const User = require('../models/user')
const Exercise = require('../models/exercise')

const router = express.Router()

router.get('/', (req, res) => {
    User.find().select('-__v')
        .then(users => res.json(users))
        .catch(err => res.sendStatus(500))
})

router.post('/', (req, res) => {

    const user = new User({
        username: req.body.username
    });

    user.save()
        .then(savedUSer => {
            const userObject = savedUSer.toObject()
            delete userObject.exercises
            delete userObject.__v
            res.json(userObject)
        })
        .catch(err => res.json(err))
})

router.post('/:_id/exercises', (req, res) => {

    if (isNaN(req.body.duration) || (req.body.duration < 0)) {
        return res.json("Duration must be a number greater than 0.")
    }

    if(req.body.date) {
        if (!/\d{4}-\d{2}-\d{2}/.test(req.body.date)) {
            return res.json("Date format must be yyyy-mm-dd")
        }
        req.body.date = new Date(req.body.date);
    } else {
        req.body.date = new Date();
    }

    User.findById(req.body[':_id'], (err, user) => {
        if(err) return res.sendStatus(404)
        const exercise = new Exercise(req.body)
        user.exercises.push(exercise._id)
        exercise.save()
        user.save()
        res.json({
            "_id": user._id,
            "username": user.username,
            "date": exercise.date.toDateString(),
            "duration": exercise.duration,
            "description": exercise.description
        })
    })
});

router.get('/:_id/logs', (req, res) => {

    const fromDate = req.query.from ? new Date(req.query.from) : null
    const toDate = req.query.to ? new Date(req.query.to) : null

    const match = {}
    if (fromDate && toDate) {
        match.date = {
            $gte: fromDate,
            $lte: toDate
        }
    }

    User.findById(req.params._id)
        .populate({
            path: 'exercises',
            match: match
        })
        .exec((err, user) => {
            if (err) return res.sendStatus(404)
            const limit = req.query.limit ? parseInt(req.query.limit) : user.exercises.length
            res.json(createResponseObject(user, limit))
        })
})

function createResponseObject(user, limit) {
    return {
        "_id": user._id,
        "username": user.username,
        "count": limit,
        "log": user.exercises.slice(0, limit).map(exercise => {
            const { _id, __v, ...exerciseObject } = exercise.toObject();
            exerciseObject.date = exerciseObject.date.toDateString()
            return exerciseObject;
        })
    };
}
// /api/users/63af9c9c1c108c90dbfd9be1/logs?from=2022-06-01&to=2022-06-31

// {"_id":"63af8af6cc1d683431f8b718","username":"user","count":3,"log":[{"description":"Push and rotation 1","duration":12,"date":"Sat Dec 31 2022"},{"description":"Push and rotation 2","duration":12,"date":"Tue Oct 11 2022"},{"description":"Push and rotation 3","duration":23,"date":"Tue Oct 11 2022"}]}


module.exports = router;
