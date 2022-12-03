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
var io = require("socket.io")(http);

app.use(morgan('dev'))
app.use(express.json());
app.use(cors(false));
app.get("/", function (req, res) {
   res.send('sever run')
});

app.use("/api", router);
app.use(notFoundMdw); 
app.use(errorHandleMdw);

connectToDb()

webSocket(io)

http.listen(port, () => {
   console.log(`Sever is runing at port ${port}`);
});

