import express from "express"
import dotenv from "dotenv"
import authRouter from './routes/auth.route.js'
import usersRouter from './routes/users.route.js'
import http from "http"
import connectToMongoDB from "./db/mongoDBConnection.js"
import cors from 'cors';
import cookieParser from "cookie-parser";


// dotenv library loads environment variables from .env file into process.env


dotenv.config();
const PORT = process.env.PORT || 5000;
// use the port specified in the environment variable PORT, or default to port 5000


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
   credentials: true,
   origin: ["http://localhost:3000", "http://localhost:3001","http://15.207.16.101:3000/","http://15.207.16.101:3001/"]
  }));
  
const server = http.createServer(app);


app.use("/auth", authRouter);
app.use('/users', usersRouter);;

app.get('/', (req, res) => {
   res.send("Welcome to HHLD Chat App!");
});

server.listen(PORT, (req, res) => {
   console.log(`Server is running at ${PORT}`);
   connectToMongoDB();
})