const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res) => {
    const nuevo = new User({
        username: req.body.username
    });

    nuevo.save()
        .then(savedUSer => {
            const userObject = savedUSer.toObject();
            delete userObject.__v
            res.json(userObject)
        })
        .catch(err => res.json(err))
})

router.get('/', (req, res) => {
    User.find().select('-__v')
        .then(users => res.json(users))
        .catch(err => res.sendStatus(500))
})

module.exports = router;
