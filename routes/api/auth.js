const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route  GET api/auth
// @desc   Test route
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post('/', 
 //validate inputs
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(), 
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()}); //return bad request on validation error
    }

    const{ email, password } = req.body; //destructuring
    
    try {
        // Step 1: See if user exists in database
        let user = await User.findOne({ email });

        if(!user){  //if no user exists send error
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }


        // Step 2: Match user to password

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        // Step 3: Return jsonwebtoken

        const payload = { //create payload (unique id)
            user: {
                id: user.id
            }
        }

        jwt.sign(payload,  //payload
            config.get('jwtSecret'), //secret
            { expiresIn: 3600000},
            (err, token) => { //either returns error or token
                if(err) throw err;
                res.json({ token });
            });

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
    

    
});

module.exports = router;