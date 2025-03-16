'use client'
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import { useAuthStore } from '../zustand/useAuthStore.js';
import axios from 'axios';
import { useUsersStore } from '../zustand/useUsersStore.js';
import ChatUsers from '../_components/ChatUsers.jsx';
import { useChatReceiverStore } from '../zustand/useChatReceiverStore.js';
import { useChatMsgsStore } from '../zustand/useChatMsgsStore.js';
import dotenv from "dotenv";

const Chat = () => {
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState(''); // Ensure it's an empty string
  const [socket, setSocket] = useState(null);
  const {authName, updateAuthName} = useAuthStore();
  const { updateUsers } = useUsersStore();
  const chatReceiver = useChatReceiverStore((state) => (state.chatReceiver));  
  const { chatMsgs, updateChatMsgs } = useChatMsgsStore();
  

  useEffect(() => {
    // Establish WebSocket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_BE_HOST}:8081`, {
        query: {
            username: authName
        }
    })
    dotenv.config();
    getUsers();

    setSocket(newSocket);

    // Listen for incoming messages
    newSocket.on('chat msg', (msgrecv) => {
      console.log('Received msg on client:', msgrecv);
      updateChatMsgs([...chatMsgs, msgrecv]);
      //setMsgs(prevMsgs => [...prevMsgs, { text: msgrecv, sentByCurrUser: false }]);
    });

    // Cleanup: Close socket connection
    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  const sendMsg = (e) => {
    e.preventDefault();
    if(socket) {
        const msgMapped = {
            sender: authName,
            receiver: chatReceiver,
            text: msg
        }
          socket.emit('chat msg', msgMapped);
          updateChatMsgs([...chatMsgs, msgMapped]);
          //setMsgs(prevMsgs => [...prevMsgs, { text: msg, sentByCurrUser: true }]);
          setMsg('');
      }
  };
  const getUsers = async () => {
    const res = await axios.get(`${process.env.PUBLIC_NEXT_BE_HOST}:5001/users`,
        {
            withCredentials: true
        })
    console.log(res);
    updateUsers(res.data)
}

return (
    <div className='h-screen flex divide-x-4'>
        <div className='w-1/5 '>
            <ChatUsers/>
        </div>
        <div className='w-4/5 flex flex-col'>
            <div className='1/5'>
                <h1>
                    {authName} is chatting with {chatReceiver ? chatReceiver: ''}
                </h1>
            </div>
            <div className='msgs-container h-3/5 overflow-scroll'>
                {chatMsgs.map((msg, index) => (
                    <div key={index} className={`m-3 p-1 ${msg.sender === authName ? 'text-right' : 'text-left'}`}>
                        <span className={`p-2 rounded-2xl ${msg.sender === authName ? 'bg-blue-200' : 'bg-green-200'}`}>
                        {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className='h-1/5 flex items-center justify-center'>
                <form onSubmit={sendMsg} className="w-1/2">  
                    <div className="relative">  
                        <input type="text"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                placeholder="Type your text here"
                                required
                                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  />
                        <button type="submit"
                                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
   </div>
 )
}

export default Chat;
