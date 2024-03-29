const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');


const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @route  GET api/profile/me
// @desc   Get current user profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', //find user profile from current user id
        ['name', 'avatar']); //populate method to grab info from user schema 

        if(!profile){
            return res.status(400). json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private

router.post('/', 
    auth, 
    check('status', 'Status is required').not().isEmpty(), //validate fields
    check('skills', 'Skills is required').not().isEmpty()
    , 
    async (req, res) =>{
    const errors = validationResult(req); //variable takes in any errors during the validation process
    if(!errors.isEmpty){
        return res.status(400).json({ errors: errors.array() }); //return array of errors collected
    }
    
    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //Build profile object
    const profileFields = {}; //make empty object and check if each field exists

    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status ;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim()); //split comma separated list and trim spaces
    }


    //Build social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;
    console.log(profileFields.skills);


    //Update and insert data
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields},
                { new: true }
                );

                return res.json(profile);
        }

        //Create and save to db
        profile = new Profile(profileFields);
        
        await profile.save();

        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;