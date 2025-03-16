import express from "express"
import http from "http"
import { Server } from "socket.io";
import dotenv from "dotenv"
import msgsRouter from "./routes/msgs.route.js"
import { addMsgToConversation } from "./controllers/msgs.controller.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import cors from 'cors';
import { subscribe, publish } from "./redis/msgsPubSub.js";

// dotenv library loads environment variables from .env file into process.env


dotenv.config();
const PORT = process.env.PORT || 5000;
// use the port specified in the environment variable PORT, or default to port 5000


const app = express();
const server = http.createServer(app);
app.use(cors({
   credentials: true,
   origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002","http://15.207.16.101:3000/","http://15.207.16.101:3001/"]
  }));

  
const io = new Server(server, {
   cors: {
       allowedHeaders: ["*"],
       origin: "*"
     }
});
// io is an instance of the Socket.IO server class that is associated with and attached to the HTTP server


// Allow WebSocket connections from different origins to the Socket.IO server by relaxing the browser's same-origin policy
const userSocketMap = {};

io.on("connection", (socket) => {
   console.log('Client connected');
   const username = socket.handshake.query.username;
   userSocketMap[username] = socket;
   const channelName = `chat_${username}`
   subscribe(channelName, (msg) => {
         console.log('Received message:', msg);
         socket.emit("chat msg", JSON.parse(msg));
   });
   console.log('Username:', username);
   socket.on('chat msg', (msg) => {
      const receiverSocket = userSocketMap[msg.receiver];
      if(receiverSocket) {
         console.log("inside recieverSocket")
         receiverSocket.emit('chat msg', msg);
      } else {
         // sender and receiver on diff BEs, so we need to use pubsub
         const channelName = `chat_${msg.receiver}`
         publish(channelName, JSON.stringify(msg));
       }
      console.log(msg);
      addMsgToConversation([msg.sender, msg.receiver],
         {
         text: msg.text,
         sender:msg.sender,
         receiver:msg.receiver
         });

      });
})



// When a client connects to the Socket.IO server, a unique socket object is created to represent that client's connection. This socket object allows bidirectional communication between the server and the specific client that it represents.


app.get('/', (req, res) => {
   res.send("Welcome to HHLD Chat App!");
});
app.use('/msgs', msgsRouter);


server.listen(PORT, (req, res) => {
   connectToMongoDB();
   console.log(`Server is running at ${PORT}`);
})
