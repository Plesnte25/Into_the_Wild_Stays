const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config();

const mongoURI = process.env.MONGO_URI;
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.error("Error connecting to Mongo:", error);
    }
}

module.exports = connectToMongo;