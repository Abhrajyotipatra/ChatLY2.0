require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require("./src/service/ai.service")

connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "http://localhost:5173", // Your frontend URL ( cors)
    }
 });


// const chatHistory = [];


io.on("connection", (socket) => {    
   console.log("A user connected");

   socket.chatHistory =[];

   socket.on("disconnect", () => {``
       console.log("A user disconnected");
   });

//    socket.on("ai-message", async(data) => {
//         console.log("Received AI message:", data);

//       socket.chatHistory.push({
//             role: "user",
//             parts: [{ text: data }]
//         })

//        const response = await generateResponse(socket.chatHistory);

//        socket.chatHistory.push({
//            role: "model",
//            parts: [{ text: response }]
//        });

//     //    console.log("AI response:", response);
//        socket.emit("ai-message-response",  response );
//    });
  

//Better Error Handling Wrap AI calls with try/catch to avoid crashing server

socket.on("ai-message", async (data) => {
  try {
     // 1️⃣ Push the user message
    socket.chatHistory.push({ role: "user", parts: [{ text: data }] });

    // 2️⃣ Limit memory (keep only the last 30 messages)
    if (socket.chatHistory.length > 30) {
      socket.chatHistory.shift(); // removes oldest
    }
    
      // 3️⃣ Ask the AI with the (trimmed) history
    const response = await generateResponse(socket.chatHistory);
     
     // 4️⃣ Push AI’s reply
    socket.chatHistory.push({ role: "model", parts: [{ text: response }] });
    
       // 5️⃣ Send back to client
    socket.emit("ai-message-response", response);

  } catch (err) {
    console.error("AI error:", err);
    socket.emit("ai-message-response", "⚠️ Sorry, something went wrong.");
  }
});



});

httpServer.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
    
})





//chatHistory formate

//     {
//     role: "user",
//     parts: [{ text: 'Who was the PM of INDIA in 2019?' }]
//    },
//    {
//     role: "model",
//     parts: [{ text: 'The Prime Minister of India in 2019 was **Narendra Modi**.\n' }]
//    }
   


