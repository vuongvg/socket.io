// require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectToDb } = require("./database/connect");
const { notFoundMdw } = require("./middlewares/notFoundMdw");
const { errorHandleMdw } = require("./middlewares/errorHandleMdw");
const router = require("./routers");
const { webSocket } = require("./socket/socket");
const morgan = require("morgan");

const port = process.env.PORT || 5001;

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http,{
   transports: ['websocket'],
   pingInterval: 1000 * 60 * 5,
   pingTimeout: 1000 * 60 * 3
 });

// app.use(morgan('dev'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms [:date[web]]'))
app.use(express.json());
app.use(cors(false));

let time
let i=0
app.get("/", function (req, res) {
   res.send('sever run')
});
// app.get("/start", function (req, res) {
//    time=setInterval(() => {
//       i++
//       console.log('time: ',new Date().toLocaleString())
//    }, 5*60*1000);
//    res.send('sever start time')
// });
// app.get("/stop", function (req, res) {
//    console.log('i',i)
//    clearInterval(time)
//    res.send('sever stop time: i '+i)
// });

app.use("/api", router);
app.use(notFoundMdw); 
app.use(errorHandleMdw);

connectToDb()

webSocket(io)

http.listen(port, () => {
   console.log(`Sever is runing at port ${port}`);
});

