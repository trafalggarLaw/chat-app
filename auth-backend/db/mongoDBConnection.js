import mongoose from "mongoose";

const connectToMongoDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Mongo DB");
    } catch (error) {
        console.log("Error in connecting ot MongoDB", error.message);
    }
}

export default connectToMongoDB;