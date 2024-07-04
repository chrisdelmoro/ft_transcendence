import { randomBetween } from '../../../utils/random.js';

export const newPowerUp = (canvasref) => {
  const execs = [
    {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.speed += 2;
      },
      color: "#f00"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.radius += 5;
      },
      color: "#f00"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          if (ball.ball.radius > 5) ball.ball.radius -= 5;
      },
      color: "#f00"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          paddleTake.paddle.speed += 2;
      },
      color: "#ff0"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          if (paddleTake.paddle.speed > 2) paddleTake.paddle.speed -= 2;
      },
      color: "#ff0"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          paddleTake.paddle.height += 20;
          if (paddleTake.paddle.y > 5) paddleTake.paddle.y -= 5;
      },
      color: "#ff0"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          if (paddleTake.paddle.height > 40) {
              paddleTake.paddle.height -= 20;
              paddleTake.paddle.y += 10;
          }
      },
      color: "#ff0"
  },
    {
      exec: (paddleTake, ball, paddleRival) => {
        if (paddleRival.paddle.speed > 1) paddleRival.paddle.speed -= 1;
      },
      color: "#00f"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
        if (paddleRival.paddle.height > 40) {
            paddleRival.paddle.height -= 20;
            paddleRival.paddle.y += 10;
        }
      },
      color: "#00f"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.dx *= 1.5;
      },
      color: "#0f0"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.dx *= 0.5;
      },
      color: "#0f0"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.dy *= 1.5;
      },
      color: "#0ff"
  },
  {
      exec: (paddleTake, ball, paddleRival) => {
          ball.ball.dy *= 0.5;
      },
      color: "#0ff"
  },
  ]
  let num = Math.floor(randomBetween(0, execs.length)); 
  let e = execs.find((e, i) => i === num);
  return PowerUp(canvasref, e.color, e.exec)
}

const PowerUp = (canvasRef, color, exec) => {
  const canvas = canvasRef;
  const ctx = canvas.getContext('2d');
  let x = Math.floor(randomBetween(20, canvas.width - 20));
  let y = Math.floor(randomBetween(100, canvas.height - 100));
  const radius = 7;
  const speed = randomBetween(3, 5);
  let angle = Math.random() * 2 * Math.PI; // Ângulo aleatório
  let dy = speed * Math.sin(angle);
  let dx = speed * Math.cos(angle);

  const render = () => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
  };

  const move = () => {
      x += dx;
      y += dy;
      if (y < 0 || y > canvas.height) {
          dy = -dy;
      }
      if (x < 0 || x > canvas.width) {
          dx = -dx;
      }
       return false// Return false to indicate it didn't go out of bounds
  };

  const checkCollision = (paddle1, ball, paddle2) => {
    let paddle = paddle1;
      // Verifica se o centro do power-up está dentro dos limites horizontais do paddle
    let horizontalCollision = x + radius >= paddle.paddle.x && x - radius <= paddle.paddle.x + paddle.paddle.width;
    // Verifica se o centro do power-up está dentro dos limites verticais do paddle
    let verticalCollision = y + radius >= paddle.paddle.y && y - radius <= paddle.paddle.y + paddle.paddle.height;

    if (horizontalCollision && verticalCollision) {
        exec(paddle1, ball, paddle === paddle1 ? paddle2 : paddle1);
        return true;
    }
    paddle = paddle2;
    // Verifica se o centro do power-up está dentro dos limites horizontais do paddle
    horizontalCollision = x + radius >= paddle.paddle.x && x - radius <= paddle.paddle.x + paddle.paddle.width;
    // Verifica se o centro do power-up está dentro dos limites verticais do paddle
    verticalCollision = y + radius >= paddle.paddle.y && y - radius <= paddle.paddle.y + paddle.paddle.height;

    if (horizontalCollision && verticalCollision) {
      exec(paddle1, ball, paddle === paddle1 ? paddle2 : paddle1);
      return true;
    }
    return false;
  };

  const respawn = () => {
      x = randomBetween(20, canvas.width - 20);
      y = randomBetween(100, canvas.height - 100);
      angle = Math.random() * 2 * Math.PI;
      dy = speed * Math.sin(angle);
      dx = speed * Math.cos(angle);
  };

  return { render, move, checkCollision, respawn, x, y, dx, dy, radius};
};

export default PowerUp;