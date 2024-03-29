const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//Used to validate user input
const { check, validationResult } = require('express-validator');

const User = require('../../models/User.js');

// @route  POST api/users
// @desc   Register a user
// @access Public
router.post('/', 
 //validate inputs
    check('name', 'Name is required').not().isEmpty(), 
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6, max: 128 })
, 
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()}); //return bad request on validation error
    }

    const{ name, email, password } = req.body; //destructuring
    
    try {
        // Step 1: See if user exists
        let user = await User.findOne({ email });

        if(user){ //if a user was already found in the database by email throw error
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // Step 2: Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        //create new instance of user based on validated data
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Step 3: Encrypt password
        const salt = await bcrypt.genSalt(10); //salt = random string used for hashing
        
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Step 4: Return jsonwebtoken

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