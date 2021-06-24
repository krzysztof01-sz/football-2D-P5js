let img, game, player, ball, goal_right, goal_left, scorer;

class Player {
  constructor(x, y) {
    this.speed = 2;
    this.size = 40;
    this.mass = 1;
    this.air_resitance_scalar = 120;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
  }
  reset() {
    this.pos.x = -100;
    this.pos.y = 0;
    this.vel = createVector(0, 0);
  }
  draw() {
    fill(200);
    strokeWeight(2);
    stroke(keyIsDown(88) ? 230 : 0);
    ellipse(this.pos.x, this.pos.y, this.size);
    stroke(0);
    strokeWeight(1);
  }
  keepOnPitch() {
    if (this.pos.x > 380) this.pos.x = 380;
    if (this.pos.x < -380) this.pos.x = -380;
    if (this.pos.y > 180) this.pos.y = 180;
    if (this.pos.y < -180) this.pos.y = -180;
  }
  control() {
    if (keyIsDown(LEFT_ARROW)) this.vel.add(createVector(-0.2, 0));
    if (keyIsDown(RIGHT_ARROW)) this.vel.add(createVector(0.2, 0));
    if (keyIsDown(UP_ARROW)) this.vel.add(createVector(0, -0.2));
    if (keyIsDown(DOWN_ARROW)) this.vel.add(createVector(0, 0.2));
    this.vel.limit(2);
  }
  render() {
    this.control();
    this.keepOnPitch();
    this.draw();
  }
}

class Ball {
  constructor(x, y) {
    this.size = 20;
    this.mass = 3;
    this.air_resitance_scalar = 70;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }
  reset() {
    this.pos.x = 0;
    this.pos.y = 0;
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }
  applyAirResistance() {
    this.air_resitance_v = createVector(this.vel.x / this.air_resitance_scalar, this.vel.y / this.air_resitance_scalar);
    this.vel.sub(this.air_resitance_v);
  }
  handleBounce() {
    if (this.pos.x >= 380 || this.pos.x <= -380) {
      if (this.pos.x > 380) this.pos.x = 380;
      if (this.pos.x < -380) this.pos.x = -380;
      this.vel.x = this.vel.x * -1;
    }
    if (this.pos.y >= 180 || this.pos.y <= -180) {
      if (this.pos.y > 180) this.pos.y = 180;
      if (this.pos.y < -180) this.pos.y = -180;
      this.vel.y = this.vel.y * -1;
    }
  }
  render() {
    this.handleBounce();
    fill(200);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class Goal {
  constructor(x, y, width) {
    this.size = 20;
    this.pos = createVector(x, y);
    this.width = width;
  }
  render() {
    ellipse(this.pos.x, this.pos.y, this.size);
    ellipse(this.pos.x, this.pos.y - this.width, this.size);
  }
}

class Scorer {
  constructor(score_A, score_B) {
    this.score_A = score_A;
    this.score_B = score_B;
  }

  listenForAGoal() {
    if (ball.pos.x > 380 && ball.pos.y > -100 && ball.pos.y < 100) {
      this.addPointForTeamA();
      this.displayScore();
      document.querySelector("canvas").classList.toggle("goal");
      setTimeout(() => {
        player.reset();
        ball.reset();
        document.querySelector("canvas").classList.toggle("goal");
      }, 1000);
    }
    if (ball.pos.x < -380 && ball.pos.y > -100 && ball.pos.y < 100) {
      this.addPointForTeamB();
      this.displayScore();
      document.querySelector("canvas").classList.toggle("goal");
      setTimeout(() => {
        player.reset();
        ball.reset();
        document.querySelector("canvas").classList.toggle("goal");
      }, 1000);
    }
  }

  displayScore() {
    document.querySelector(".score").innerText = `${this.score_A}:${this.score_B}`;
  }

  addPointForTeamA() {
    this.score_A++;
  }

  addPointForTeamB() {
    this.score_B++;
  }

  resetResult() {
    this.score_A = 0;
    this.score_B = 0;
  }
}

class Game {
  render() {
    player.render();
    ball.render();
    goal_right.render();
    goal_left.render();
  }
  listenForPlayerAndBallTouch() {
    let player_ball_vector = p5.Vector.sub(ball.pos, player.pos);
    let player_ball_distance = player_ball_vector.mag();

    // when player has a contact with ball
    if (player_ball_distance <= player.size / 2 + ball.size / 2 + 1) {
      ball.acc = player_ball_vector.div(ball.mass);
      ball.vel.add(ball.acc);

      const isXPressed = keyIsDown(88);
      isXPressed ? ball.vel.limit(10) : ball.vel.limit(1);

      ball.pos.add(ball.vel);
    }
    ball.pos.add(ball.vel);
  }
}

function preload() {
  img = loadImage("./football-pitch.png");
}

function setup() {
  createCanvas(800, 400);
  game = new Game();
  player = new Player(-100, 0);
  ball = new Ball(0, 0);
  goal_right = new Goal(-380, 100, 200);
  goal_left = new Goal(380, 100, 200);
  scorer = new Scorer(0, 0);
}

function draw() {
  background(53, 99, 22);
  translate(width / 2, height / 2);
  image(img, -400, -200);
  game.render();
  game.listenForPlayerAndBallTouch();
  ball.applyAirResistance();
  scorer.listenForAGoal();
  player.slow_v = createVector(player.vel.x / 20, player.vel.y / 20);
  player.vel.sub(player.slow_v);
  player.pos.add(player.vel);
}
