

const IA = (canvas, ball, paddle, paddlePlayer) => {
 
  function predictPowerUp(canvas, powerUps) {
    if (powerUps.length === 0) return {predictedPuY: 0, predictedPuX: 0};
    const pu = powerUps.reduce((max, item) => ((item.x > max.x)  ? item : max), powerUps[0]);
    return predictBallPosition(canvas, pu);
    
  }

  function predictBallPosition(canvas, something) {
    let predictedY = something.y;
    let predictedX = something.x;
    let dx = something.dx;
    let dy = something.dy;
    const maxSteps = 20; // Limitar o número de passos de simulação
    let steps = 0;
  
    while (predictedX < paddle.paddle.x - something.radius && steps < maxSteps) {
      predictedX += dx;
      predictedY += dy;
  
      // Refletir a bola se ela atingir as bordas superior ou inferior
      if (predictedY <= 0 || predictedY >= canvas.height) {
        dy = -dy;
      }

      if ((predictedX >= canvas.width - something.radius - paddle.paddle.width)) {
        break;
      }
      steps++;
    }
  
    return {predictedY, predictedX};
  }
  
  return {
    move: (powerUps) => {
      let pu = predictPowerUp(canvas, powerUps)
      let {predictedY, predictedX} = predictBallPosition(canvas, ball.ball);
      if (pu.predictedX > predictedX ) {
        predictedY = pu.predictedY;
      } 
      else if (pu.predictedX == 0 && predictedX > canvas.width / 2) {
        predictedY = paddlePlayer.paddle.y + paddlePlayer.paddle.height / 2;
      }
      if (predictedY < paddle.paddle.y + (paddle.paddle.height / 2)) {
        paddle.handleKeyUp({ key: 'iaDown' });
        paddle.handleKeyDown({ key: 'iaUp' });
      } else if (predictedY > paddle.paddle.y + (paddle.paddle.height / 2)) {
        paddle.handleKeyUp({ key: 'iaUp' });
        paddle.handleKeyDown({ key: 'iaDown' });
      } else {
        paddle.handleKeyDown({ key: 'iaUp' });
        paddle.handleKeyDown({ key: 'iaDown' });
      }
    }
  };
};


export default IA;