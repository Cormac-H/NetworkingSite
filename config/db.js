//Requirements
const mongoose = require('mongoose');
const config = require('config');

//Grab global mongoDB variable from config
const db = config.get('mongoURI');

const connectDB = async() => {
    try {
        await mongoose.connect(db, { //mongoose.connect returns a promise so await is needed
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }); 
        
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(error); //Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;