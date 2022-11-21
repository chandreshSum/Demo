

function initMouseControls(screenEle) {
  screenEle.onmousemove = mouseMove;
  screenEle.onmouseup = mouseUp;
  screenEle.onmousedown = mouseDown;
}

function mouseDown(evt) {
  // console.log(evt.clientX, evt.clientY);
}

function mouseUp(evt) {
  // console.log(evt.clientX, evt.clientY);
}

function mouseMove(evt) {
  console.log("🚀 ~ file: screenControls.js ~ line 18 ~ mouseMove ~ evt", evt)
  // console.log("control",evt.clientX, evt.clientY);
}