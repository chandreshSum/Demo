'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var https = require('https'); // use require('http') for http
var socketIO = require('socket.io');
var fs = require("fs");
const axios = require('axios');
const robot = require("robotjs");

var options = {
  // for http:
  key: fs.readFileSync('./signalling/apache-selfsigned.key'),
  cert: fs.readFileSync('./signalling/apache-selfsigned.crt')
};

var fileServer = new (nodeStatic.Server)();
var app = https.createServer( options, function (req, res) {
   fileServer.serve(req, res);

}).listen(1794, "0.0.0.0");

var io = socketIO.listen(app);
var allClients = [];
var roomsMap = new Map();
roomsMap.set('Room1', new Array());
roomsMap.set('Room2', new Array());
roomsMap.set('Room3', new Array());
roomsMap.set('Room4', new Array());
roomsMap.set('Room5', new Array());

var roomsLookup = new Map();


io.sockets.on('connection', function (socket) {

  allClients.push(socket);
  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function (message) {
    log('Client said: ', message);
    let roomName = roomsLookup.get(socket.id);
    if (roomName === undefined || roomName === null) {
      // for a real app, would be room-only (not broadcast)
      socket.broadcast.emit('message', message);
    }
    else {
      socket.broadcast.to(roomName).emit('message', message);
    }
  });

  socket.on('create or join', function (room) {

    let socketsPerRoom = roomsMap.get(room);
    socketsPerRoom.push(socket);
    roomsLookup.set(socket.id, room);

    axios
      .put('http://dpatelus:6de5acc0-0dbb-11ed-ab68-0242ac150003@global.xirsys.net/_turn/RemotePOS')
      .then(res => {
        //console.log(res.data)
        socket.emit('xirsys', res.data);
      })
      .catch(error => {
      })

    log('Received request to create or join room ' + room);

    //var numClients = io.sockets.sockets.length;
    var numClients = socketsPerRoom.length;
    log('Sockets per room' + room + ' ' + numClients)
    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    for (var sock in io.sockets.sockets)
      log('Room ' + room + ' now has ' + sock + ' client');

    if (numClients === 1) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
      var rooms = Object.keys(socket.rooms);

    } else if (numClients === 2) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max 5 clients
      socket.emit('full', room);
    }
  });

  socket.on('room-info', function (room_name) {
    let socketsInRoom = roomsMap.get(room_name);
    if (socketsInRoom === undefined || socketsInRoom === null) {
      socket.emit('socket_count_in_room', { roomName: room_name, count: -1 });
    }
    else
      socket.emit('socket_count_in_room', { roomName: room_name, count: socketsInRoom.length });
  });

  socket.on('ipaddr', function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function () {
    console.log('received bye');
  });

  socket.on('leave-room', function (room_name) {
    let socketsPerRoom = roomsMap.get(room_name);
    const index = socketsPerRoom.indexOf(socket);
    log('socket ' + socket.id + " trying to leave " + room_name + " " + Object.keys(socketsPerRoom[0]));
    if (index > -1) { // only splice array when item is found
      socketsPerRoom.splice(index, 1); // 2nd parameter means remove one item only
      //roomsMap.set(room_name, socketsPerRoom);
      log('socket ' + socket.id + " left " + room_name);
    }
    socket.leave(room_name);
  });

  socket.on('clear-room', function (room_name) {
    let socketsPerRoom = roomsMap.get(room_name);
    for (let i = 0; i < socketsPerRoom.length; i++) {
      socketsPerRoom[i].leave(room_name);
    }
    roomsMap.set(room_name, []);
  });

  socket.on("onMouseClick", (button, double) => {
    console.log("click", button);
    robot.mouseClick("left");
  });

  // for remote connection
  socket.on("onMouseMove", (coor) => {
    robot.setMouseDelay(10);
    
    // robot.dragMouse(coor.x, coor.y);
    // const xvalues = 400 / coor.x 
    // robot.moveMouse(((coor.x - 165)  * 5), (coor.y));
 
    // var screenSize = robot.getScreenSize();
    // console.log("🚀 ~ file: index.js ~ line 155 ~ socket.on ~ screenSize", screenSize)
    
    // socket.broadcast.emit("getScreenSize", screenSize);
    socket.broadcast.emit("setMouse", coor);
    
  });


   socket.on("onType", (data) => {

    console.log(data.length);
    if(data.length > 1){
      robot.keyTap(data.toLowerCase());
    }else{
      robot.typeString(data);
    }
    // if(data === 'Enter'){
    //   robot.keyTap("enter");
    // } else if(data === 'Backspace') {
    //   robot.keyTap("backspace" +);
    // } else {
    //   robot.typeString(data);
    // }

    socket.broadcast.emit("sendText", data);
  });


  socket.on('disconnect', function () {
    var rooms = Object.keys(socket.rooms);
    console.log('Got disconnect! ', rooms);

    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
  });
});
