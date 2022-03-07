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
let OVERTIME_SOCKETIDS = []
let interval;

io.on("connection", (socket) => {
    console.log("connection received")

    socket.on("OVERTIME", (pin) => {
        OVERTIME_SOCKETIDS[] = socket.id
        console.log("Overtime with SocketID: "+socket.id)
        io.to(socket.id).emit('PINS_CONNECTED',Object.keys(PIN_HAS_SOCKETID));
    })

    socket.on("PIN", (pin) => {
        console.log("PIN: "+pin,"SocketID: "+socket.id)

        PIN_HAS_SOCKETID[pin] = socket.id
        SOCKETID_HAS_PIN[socket.id] = pin

        OVERTIME_SOCKETIDS.map(socketid=>{
            io.to(socketid).emit('PIN_CONNECTED',SOCKETID_HAS_PIN[socketid]);
        })
    })
    socket.on("disconnect", () => {
        console.log("Disconnect PIN: "+SOCKETID_HAS_PIN[socket.id])
        console.log("Disconnect: "+socket.id)

        OVERTIME_SOCKETIDS.map(socketid=>{
            io.to(socketid).emit('PIN_DISCONNECTED',SOCKETID_HAS_PIN[socketid]);
        })

        setTimeout(function(){
            delete PIN_HAS_SOCKETID[SOCKETID_HAS_PIN[socketid]]
            delete SOCKETID_HAS_PIN[socketid]
        },100)

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
