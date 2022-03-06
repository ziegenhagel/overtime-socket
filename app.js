const express = require("express");
const http = require("http");

const port = process.env.PORT || 3000;
const hostname = port != 3000 ? "0.0.0.0" : "127.0.0.1";

const cors = require('cors')
const app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(cors())
app.options('*', cors()) // include before other routes

const server = http.createServer(app);

const io = require("socket.io")(server, { cors: { origin: '*', } }); ;

const router = express.Router();
app.use(router);

router.get("/", (req, res) => {
    res.send({succes:true}).status(200);
})

router.post("/hangup", (req, res) => {
    let socketid = PIN_HAS_SOCKETID[req.body.pin]
    io.to(socketid).emit('hangup');
    res.send({succes:true}).status(200);
})

router.post("/user", (req, res) => {
    let socketid = PIN_HAS_SOCKETID[req.body.pin]
    io.to(socketid).emit('user',req.body.user);
    res.send({succes:true}).status(200);
})

router.post("/payload", (req, res) => {

    let {pin,type,value} = req.body
    let socketid = PIN_HAS_SOCKETID[pin]

    io.to(socketid).emit('payload', {
       type,value 
    });

    res.send({succes:true}).status(200);

});


let PIN_HAS_SOCKETID = {}
let SOCKETID_HAS_PIN = {}
let interval;

io.on("connection", (socket) => {
    console.log("connection received")
    socket.on("PIN", (pin) => {
        PIN_HAS_SOCKETID[pin] = socket.id
        SOCKETID_HAS_PIN[socket.id] = pin
        console.log("PIN: "+pin,"SocketID: "+socket.id)
    })
    socket.on("disconnect", () => {
        console.log("Disconnect PIN: "+SOCKETID_HAS_PIN[socket.id])
        console.log("Disconnect: "+socket.id)
    });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

exports.name = "max"
exports.io = io
