
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup",   onKeyUp);

var KeyboardState = {
  37: false, //left
  38: false, //up
  39: false, //right
  40: false, //down
  49: false, //1
  50: false, //2
  51: false  //3
};


function onKeyUp  (e)
{
  return KeyboardState[e.keyCode]=false;
}

function onKeyDown (e)
{
  return KeyboardState[e.keyCode]=true;
}
