const router = require('express').Router();
const Director = require('../../models/Directory');
const auth = require("../../middlewares/auth");


router.post('/createDirectory', auth, async( req, res ) => {
    try {
        // let { name, }
    } catch (error) {
        res.status(400).send({ message: 'FAILED', error:error.message})
    }
});
