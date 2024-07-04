import { vr } from "../game/index.js";

const Padlle = (canvasRef, up, down, x, backgroundColor) => {
  const paddle = { 
    x: x, 
    y:  canvasRef.height / 2 - vr.PADDLE_HEIGHT / 2, 
    width: vr.PADDLE_WIDTH, 
    height: vr.PADDLE_HEIGHT, 
    speed: vr.PADDLE_SPEED,  
    keys: { up: false, down: false }
  };

  const resetPaddle = () => {
    paddle.y = canvasRef.height / 2 - paddle.height / 2;
    paddle.x = x;
    paddle.width =  vr.PADDLE_WIDTH;
    paddle.height = vr.PADDLE_HEIGHT;
    paddle.speed = vr.PADDLE_SPEED;
    paddle.keys = { up: false, down: false }
  }

  const handleKeyDown = (e) => {
    if (e.key === up) paddle.keys.up = true;
    if (e.key === down) paddle.keys.down = true;
  };
 
  const handleKeyUp = (e) => {
    if (e.key === up) paddle.keys.up = false;
    if (e.key === down) paddle.keys.down = false;
  };

  const movePaddle = () => {
    const cv = canvasRef;
    if (paddle.keys.up && paddle.y > 0 ) {
      paddle.y = Math.min(paddle.y - paddle.speed, cv.height - paddle.height);
    }
    if (paddle.keys.down && paddle.y < cv.height - paddle.height) {
      paddle.y = Math.max(paddle.y + paddle.speed, 0);
    }
  };

  const render = () => {
    const ctx = canvasRef.getContext('2d');
    ctx.fillStyle = backgroundColor; 
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  return  {
    paddle,
    render,
    resetPaddle,
    handleKeyUp,
    handleKeyDown,
    movePaddle,

}
}
export default Padlle;