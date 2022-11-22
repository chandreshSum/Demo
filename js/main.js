//'use strict';

var peerModeAudio = true;

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var receivedOffer = false;
var localStream = null;
var pcAudio;
var remoteStream;

var isChannelReadyScreen = false;
var isInitiatorScreen = false;
var isStartedScreen = false;
var receivedOfferScreen = false;
var localStreamScreen = null;
var pcScreenShare;
var remoteStreamSreen;
var newValues = false
var turnReady;

var pcConfig = {
  iceServers: [
    {
      url: "stun:stun.l.google.com:19302",
    },
  ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
};
var constraints = {
  video: false,
  audio: true,
};

let statusEle = null;
let hangupEle = document.getElementById("disconnect");
let connectEle = document.getElementById("joinnow");
let leaveRoomEle = document.getElementById("leaveRoom");
let selectEle = document.getElementById("rooms_list");
let shareScreenEle = document.getElementById("sharenow");
let clearRoomEle = document.getElementById("clearRoom");
selectEle.selectedIndex = -1;

/////////////////////////////////////////////

// Could prompt for room name:
var room = "DefaultPOS"; //prompt('Enter room name:', 'DefaultRoom');
var receivedIceServers = null;

let mobileCheck = screen.orientation.type === "portrait-primary";
// () => {
//   let check = false;
//   (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
//   return check;
// };

//alert(window.navigator.connection.type)
let socketServerURL = "https://192.168.1.50:1700";
console.log(
  "mobile check ",
  mobileCheck,
  navigator.userAgent,
  screen.orientation
);
if (!mobileCheck) {
  socketServerURL = "https://192.168.1.50:1700";
}
//staging
//var socket = io.connect("https://remoteposdemo.socialcup.co:1794");
//local
var socket = io.connect(socketServerURL);
let clientCount = false;

//Check for available rooms
socket.emit("room-info", "Room1");
socket.emit("room-info", "Room2");
socket.emit("room-info", "Room3");
socket.emit("room-info", "Room4");
socket.on("socket_count_in_room", function (obj) {
  console.log(`Room ${obj.roomName} as ${obj.count} users`);
  if (obj.count <= 1) {
    let op = new Option(obj.roomName, obj.roomName);
    op.setAttribute("id", obj.roomName);
    selectEle.options.add(op);
  }
});

selectEle.addEventListener("change", (event) => {
  console.log("you selected " + event.target.value);
  selectEle.disabled = true;
  leaveRoomEle.disabled = false;
  room = event.target.value;
  start();
});

//Start
function start() {
  socket.emit("create or join", room);
  setStatus("Joined Room :" + room, "#00aa00");
}

acquireMediaSource();

socket.on("created", function (room) {
  console.log("Created room " + room);
  isInitiator = true;
});

socket.on("full", function (room) {
  console.log("Room " + room + " is full");
});

socket.on("join", function (room) {
  console.log("Another peer made a request to join room " + room);
  console.log("This peer is the initiator of room " + room + "!");
  isChannelReady = true;
  //Ready to call
  connectEle.disabled = false;
  shareScreenEle.disabled = false;
  setStatus("Peer joined", "#00aa00");
  clientCount = true;
});

socket.on("joined", function (room) {
  console.log("joined: " + room);
  isChannelReady = true;
  setStatus("Joined: " + room);
  //Ready to call
  connectEle.disabled = false;
  shareScreenEle.disabled = false;
  clientCount = true;
});

socket.on("xirsys", function (data) {
  receivedIceServers = data.v;
  console.log("received ice servers", receivedIceServers);
  //connectEle.disabled = false;
});

socket.on("log", function (array) {
  console.log.apply(console, array);

});

////////////////////////////////////////////////

function sendMessage(message) {
  shareScreenEle.disabled = true;

  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

// This client receives a message
socket.on("message", function (message) {
  console.log("Client received message:", message);
  if(newValues === true && message.type === "candidate")
 {
   shareScreenEle.disabled = true; 
 }
  else if (message.type === "candidate") {
    shareScreenEle.disabled = false;
  }

  if (message === "got user media") {
    //maybeStart();
  } else if (message.type === "offer") {
    if (peerModeAudio) receivedOffer = true;
    else receivedOfferScreen = true;
    if (!isStarted) {
      maybeStart();
    }
    if (!isStartedScreen) {
      maybeStartScreen();
    }
    if (peerModeAudio) {
      pcAudio.setRemoteDescription(new RTCSessionDescription(message));
    } else {
      pcScreenShare.setRemoteDescription(new RTCSessionDescription(message));
    }
    doAnswer();
  } else if (message.type === "answer" && isStarted) {
    
    if (peerModeAudio)
    {

      shareScreenEle.disabled = true;
      pcAudio.setRemoteDescription(new RTCSessionDescription(message));
    }
    else {
      shareScreenEle.disabled = true;
      newValues = true
      pcScreenShare.setRemoteDescription(new RTCSessionDescription(message));
    }
  } else if (message.type === "candidate" && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    if (peerModeAudio) pcAudio.addIceCandidate(candidate);
    else {
      pcScreenShare.addIceCandidate(candidate);
    }
  } else if (message === "bye" && isStarted) {
    handleRemoteHangup();
  } else if (message === "bye screen" && isStartedScreen) {
    handleRemoteHangupScreen();
  } else if (message === "leftRoom") {
    setStatus("Peer left", "#ff0000");
    connectEle.disabled = true;
    // shareScreenEle.disabled = true;
  } else if (message === "share screen mode") {
    console.log("peerModeAudio off");
    isChannelReadyScreen = true;
    peerModeAudio = false;
    isInitiatorScreen = false;
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");
var remoteScreen = document.querySelector("#remoteScreen");
initMouseControls(remoteScreen);

// function mouseMove(e){
//   console.log('remoteScreen', remoteScreen.onmousemove)
// }
function acquireMediaSource() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(function (e) {
      alert("getUserMedia() error: " + e.name);
    });
}

function init() {
  // navigator.mediaDevices.getUserMedia(constraints)
  //   .then(gotStream)
  //   .catch(function (e) {
  //     alert('getUserMedia() error: ' + e.name);
  //   });

  maybeStart();

  connectEle.disabled = true;
  hangupEle.disabled = false;
}

async function shareScreen() {
  localStreamScreen = await getLocalScreenCaptureStream();
  console.log("localStreamScreen: ", localStreamScreen);
  isChannelReadyScreen = true;
  peerModeAudio = false;
  isInitiatorScreen = true;
  socket.emit("message", "share screen mode");
  setTimeout(maybeStartScreen(), 3000);
}

function leaveRoom() {
  //socket.leave(room);
  socket.emit("leave-room", room);
  selectEle.disabled = false;
  leaveRoomEle.disabled = true;
  selectEle.selectedIndex = 0;
  setStatus("Left Room :" + room, "#ff0000");
  sendMessage("leftRoom");
  connectEle.disabled = true;
  // shareScreenEle.disabled = true;
}

function clearRoom(ele) {
  let id = ele.getAttribute("id");
  console.log("🚀 ~ file: main.js ~ line 288 ~ clearRoom ~ id", id)
  switch (id) {
    case "clearRoom1":
      socket.emit("clear-room", "Room1");
      console.log("Room1 cleared");
      // location.reload();
      break;
    case "clearRoom2":
      socket.emit("clear-room", "Room2");
      console.log("Room2 cleared");
      // location.reload();
      break;
    case "clearRoom3":
      socket.emit("clear-room", "Room3");
      console.log("Room3 cleared");
      // location.reload();
      break;
    case "clearRoom4":
      socket.emit("clear-room", "Room4");
      console.log("Room4 cleared");
      // location.reload();
      break;
  }
}


function clearDynamically(ele) {
  if(ele === "Room1")
  {
      socket.emit("clear-room", "Room1");
      // location.reload();

  }
  else if((ele === "Room2"))
  {
    socket.emit("clear-room", "Room2");
      location.reload();

  }
else if((ele === "Room3"))
{
  socket.emit("clear-room", "Room3");
      location.reload();

}
else {
  socket.emit("clear-room", "Room4");
      location.reload();

}

  // switch (ele) {
  //   case ele === 'Room1':
  //     console
  //     socket.emit("clear-room", "Room1");
  //     console.log("Room1 cleared");
  //     // location.reload();
  //     break;
  //   case "clearRoom2":
  //     socket.emit("clear-room", "Room2");
  //     console.log("Room2 cleared");
  //     // location.reload();
  //     break;
  //   case "clearRoom3":
  //     socket.emit("clear-room", "Room3");
  //     console.log("Room3 cleared");
  //     // location.reload();
  //     break;
  //   case "clearRoom4":
  //     socket.emit("clear-room", "Room4");
  //     console.log("Room4 cleared");
  //     // location.reload();
  //     break;
  // }
}


function gotStream(stream) {
  console.log("Adding local stream.");
  if ("srcObject" in localVideo) {
    localVideo.srcObject = stream;
  } else {
    // deprecated
    localVideo.src = window.URL.createObjectURL(stream);
  }
  localStream = stream;
  sendMessage("got user media");
}

console.log(
  "Getting user media with constraints",
  constraints,
  location.hostname
);

// if (location.hostname !== 'localhost') {
//   requestTurn(
//     //    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
//     'https://service.xirsys.com/ice?ident=vivekchanddru&secret=ad6ce53a-e6b5-11e6-9685-937ad99985b9&domain=www.vivekc.xyz&application=default&room=testing&secure=1'

//   );
// }

function maybeStart() {
  console.log(">>>>>>> maybeStart() ", isStarted, localStream, isChannelReady);
  if (!isStarted && localStream !== null && isChannelReady) {
    console.log(">>>>>> creating peer connection");
    createPeerConnection();
    pcAudio.addStream(localStream);
    isStarted = true;
    console.log("isInitiator", isInitiator);
    //if (isInitiator) {
    doCall();
    //}
  } else if (isStarted && localStream !== null && isChannelReady) {
    console.log(">>>>>> creating peer connection");
    createPeerConnection();
    pcAudio.addStream(localStream);
    doCall();
  }
}

window.onbeforeunload = function () {
  sendMessage("bye");
  sendMessage("leftRoom");
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  if (peerModeAudio) {
    try {
      pcAudio = new RTCPeerConnection(receivedIceServers);
      pcAudio.onreadystatechange = handleIceCandidate;
      if ("ontrack" in pcAudio) {
        pcAudio.ontrack = handleRemoteStreamAdded;
      } else {
        // deprecated
        pcAudio.onaddstream = handleRemoteStreamAdded;
      }
      pcAudio.onremovestream = handleRemoteStreamRemoved;
      console.log("Created RTCPeerConnnection");
    } catch (e) {
      console.log("Failed to create PeerConnection, exception: " + e.message);
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  } else {
    try {
      pcScreenShare = new RTCPeerConnection(receivedIceServers);
      pcScreenShare.onaddstream = handleIceCandidateScreen;
      if ("ontrack" in pcScreenShare) {
        console.log("Not Found Stream")
        pcScreenShare.ontrack = handleRemoteStreamAddedScreen;
      } else {
        console.log("Found Stream")
 
        // deprecated
        pcScreenShare.onaddstream = handleRemoteStreamAddedScreen;
      }
      pcScreenShare.onremovestream = handleRemoteStreamRemovedScreen;
      console.log("Created RTCPeerConnnection for screen share");
    } catch (e) {
      console.log(
        "Failed to create PeerConnection screen share, exception: " + e.message
      );
 
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  }
}

function handleIceCandidate(event) {
  console.log("icecandidate event: ", event);
  if (event.candidate) {
    sendMessage({
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
    });
  } else {
    console.log("End of candidates.");
  }
}

function handleRemoteStreamAdded(event) {
  console.log("Remote stream added.");
  if ("srcObject" in remoteVideo) {
    remoteVideo.srcObject = event.streams[0];
  } else {
    // deprecated
    remoteVideo.src = window.URL.createObjectURL(event.stream);
  }
  remoteStream = event.stream;
  setStatus("Call connected", "#00aa00");
  connectEle.disabled = true;
  hangupEle.disabled = false;
}

function handleCreateOfferError(event) {
  console.log("createOffer() error: ", event);
}

function doCall() {
  if (peerModeAudio) {
    if (!receivedOffer) {
      console.log("Sending offer to peer");
      pcAudio.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }
  } else {
    if (!receivedOfferScreen) {
      console.log("Sending offer to peer screen");
      pcScreenShare.createOffer(
        setLocalAndSendMessageScreen,
        handleCreateOfferErrorScreen
      );
    }
  }
}

function doAnswer() {
  if (peerModeAudio) {
    console.log("Sending answer to peer.");
    pcAudio
      .createAnswer()
      .then(setLocalAndSendMessage, onCreateSessionDescriptionError);
  } else {
    shareScreenEle.disabled = true;
    pcScreenShare
      .createAnswer()
      .then(
        setLocalAndSendMessageScreen,
        onCreateSessionDescriptionErrorScreen
      );
  }
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pcAudio.setLocalDescription(sessionDescription);
  console.log("setLocalAndSendMessage sending message", sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  console.log("Failed to create session description: " + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].url.substr(0, 5) === "turn:") {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log("Getting TURN server from ", turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log("Got TURN server: ", turnServer);
        pcConfig.iceServers.push({
          url: "turn:" + turnServer.username + "@" + turnServer.turn,
          credential: turnServer.password,
        });
        turnReady = true;
      }
    };
    xhr.open("GET", turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamRemoved(event) {
  console.log("Remote stream removed. Event: ", event);
}

function hangup() {
  console.log("Hanging up.");
  stop();
  sendMessage("bye");
}

function handleRemoteHangup() {
  console.log("Session terminated.");
  hangupEle.disabled = true;
  connectEle.disabled = false;
  // shareScreenEle.disabled = false;
  stop();
  isInitiator = false;
  setStatus("Call disconnected ", "#ff0000");
  location.reload();
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  clearDynamically(room)
  newValues=false
  pcAudio.close();
  pcAudio = null;
  receivedOffer = false;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split("\r\n");
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search("m=audio") !== -1) {
      mLineIndex = i;
      break;
    }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search("opus/48000") !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(
          sdpLines[mLineIndex],
          opusPayload
        );
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join("\r\n");
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(" ");
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) {
      // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(" ");
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(" ");
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length - 1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(" ");
  return sdpLines;
}

function setStatus(text, color = "#000000") {
  if (statusEle === null) {
    statusEle = document.getElementById("status");
  }
  statusEle.innerHTML = text;
  if (color.length > 0) statusEle.style.color = color;
}

function disconnectCall() {
  hangupEle.disabled = true;
  connectEle.disabled = false;
  // shareScreenEle.disabled = false;
  setStatus("Call disconnected", "#ff0000");
  hangup();
}

/////////// for robot.js ////////////

function handleMouseMove(e) {
  if (shareScreenEle.disabled === true && clientCount === true) {
    let coor = { x: e.clientX, y: e.clientY };
    console.log("coor", coor);
    socket.emit("onMouseMove", {
      x: e.clientX,
      y: e.clientY,
    });
    socket.on("broadcast", function (data) {
      console.log("Data", data);
    });
  }
}

const video = document.getElementById("remoteScreen");
video.addEventListener("mousemove", handleMouseMove);

function handleMouseEnter(e) {
  console.log("clientCount ----", clientCount, shareScreenEle.disabled);
  if (shareScreenEle.disabled === true && clientCount === true) {
    lastX = e.clientX;
    lastY = e.clientY;
    console.log("call handleMouseEnter", e);

    // emits message from user side
    socket.emit("onMouseMove", {
      x: e.clientX,
      y: e.clientY,
    });

    socket.on("broadcast", function (data) {
      console.log("Data", data);
    });
  }
}

function showCoords(event) {
  if (shareScreenEle.disabled === true && clientCount === true) {
    socket.emit("onMouseClick", {
      x: event.screenX,
      y: event.screenY,
    });
  }
}

function getText(event) {
  if (shareScreenEle.disabled === true && clientCount === true) {
    console.log("event   ", event);
    socket.emit("onType", event.key);
  }
}

socket.emit("getScreenSize", function (display) {
  console.log("Display", display);
});

// localStream.getVideoTracks()[0].onended = function () {
//   console.log('get --------------------------');
//   // doWhatYouNeedToDo();
// };

// setInterval(() => {
//   console.log("isShearing: -", localStream)
// }, 1000);


// for mouse move 
const el = document.querySelector('.mouse');
let lastMove = 0;

// function onMouseMove(e) {
// x = e.clientX;
// y = e.clientY;
// lastMove = Date.now();
// }


socket.on("setMouse", function (data) {  
 
});

function updateMouse(x, y) {
console.log(' call update function ', x)
 document.documentElement.style.setProperty('--x', x);
 document.documentElement.style.setProperty('--x', y);
}

// function render(a) {
// if (Date.now() - lastMove > 500) {
  // socket.on("setMouse", function (data) {
  //   console.log("Data     - x", data.x);
  //   console.log("Data     - y ", data.y);
  //   updateMouse(data.x, data.y);
  // });
// updateMouse(x, y);
// }

// requestAnimationFrame(render);
// }

// window.addEventListener('mousemove', onMouseMove);
// requestAnimationFrame(render);