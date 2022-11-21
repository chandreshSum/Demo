function maybeStartScreen() {
  if (!isStartedScreen /*&& localStreamScreen !== null*/ && isChannelReadyScreen) {
    createPeerConnection();
    if (isInitiatorScreen)
      pcScreenShare.addStream(localStreamScreen);
    isStartedScreen = true;
    console.log('isInitiator', isInitiatorScreen);
    //if (isInitiator) {
    doCall();
    //}
  }
  else if (isStartedScreen && localStreamScreen !== null && isChannelReadyScreen) {
    console.log('>>>>>> creating peer connection screen');
    createPeerConnection();
    pcScreenShare.addStream(localStreamScreen);
    doCall();
  }
  else {
    console.error("can't create peer connection");
  }
}

const getLocalScreenCaptureStream = async () => {
  try {
    const constraints = { video: { cursor: 'always' }, audio: false };
    const screenCaptureStream = await navigator.mediaDevices.getDisplayMedia(constraints);

    return screenCaptureStream;
  } catch (error) {
    console.error('failed to get local screen', error);
  }
};

function handleIceCandidateScreen(event) {
  console.log("🚀 ~ file: screenShare.js ~ line 35 ~ handleIceCandidateScreen ~ event", event)
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAddedScreen(event) {
  console.log('Remote stream added.');
  alert('Remote stream added.');
  if ('srcObject' in remoteScreen) {
    remoteScreen.srcObject = event.streams[0];
  } else {
    // deprecated
    remoteScreen.src = window.URL.createObjectURL(event.stream);
  }
  remoteScreenStream = event.stream;
  //setStatus("Call connected", '#00aa00');
  //connectEle.disabled = true;
  //hangupEle.disabled = false;
}

function handleCreateOfferErrorScreen(event) {
  console.log('createOffer() error: ', event);
}

function handleRemoteStreamRemovedScreen(event) {
  console.log('Remote stream removed. Event: ', event);
}

function setLocalAndSendMessageScreen(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pcScreenShare.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage screen sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function handleCreateOfferErrorScreen(event) {
  console.log('createOffer() screen error: ', event);
}
``
function onCreateSessionDescriptionErrorScreen(error) {
  trace('Failed to create session description screen: ' + error.toString());
}

function handleRemoteHangupScreen() {
  console.log('Session terminated.');
  //hangupEle.disabled = true;
  //connectEle.disabled = false;
  stopScreen();
  isInitiatorScreen = false;
  setStatus('Screen share disconnected ', '#ff0000');
}

function stopScreen() {
  console.log('stopScreen ---------');
  isStartedScreen = false;
  pcScreenShare.close();
  pcScreenShare = null;
  receivedOfferScreen = false;
}

function disconnectScreenShare() {
  console.log('disconnectScreenShare ---------');
  //hangupEle.disabled = true;
  //connectEle.disabled = false;
  setStatus("Screen share disconnected", '#ff0000');
  hangupScreen();
}

function hangupScreen() {
  console.log('hangupScreen ---------');

  console.log('Hanging up.');
  stopScreen();
  sendMessage('bye screen');
}
