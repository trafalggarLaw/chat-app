import User from "../models/user.model.js";
import bcrypt from "bcrypt";    
import generateJWTTokenAndSetCookie from "../utils/generateToken.js";

const signup = async (req, res) => {
    try {
        const {username, password} = req.body;
        console.log(username, password);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const foundUser = await User.findOne({username});
        if(foundUser) {
            res.status(201).json({message:"User already exists"});
        }else{
            const user = new User({username: username, password: hashedPassword});
            generateJWTTokenAndSetCookie(user._id, res);
            await user.save();
            res.status(201).json({message:"User got created!!"});
        }
    } catch(error) {
        console.log("error in signup: ", error)
    }
}
export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        
        const foundUser = await User.findOne({username});
        if(!foundUser) {
            res.status(401).json({message:"Authentication Failed: User does not exist!"});
        }else{
            const isPasswordMatched = await bcrypt.compare(password, foundUser.password);
            if(!isPasswordMatched) {
                res.status(401).json({message:"Authentication Failed: Incorrect Password!"});
            }
            generateJWTTokenAndSetCookie(foundUser._id, res);
            res.status(201).json({message:"Logged in successfully!"});
        }
    } catch(error) {
        console.log("error in Loggin in: ", error.message)
    }
}

export default signup;