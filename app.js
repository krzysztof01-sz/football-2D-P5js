let game,
  players = [],
  goals = [],
  ball,
  scorer;

const colors = {
  pitch: "#356316",
  redTeam: "#e32020",
  blueTeam: "#3e24e3",
  light: "#e6e6e6",
  dark: "#000",
};

const KEY_CODES = {
  space: 32,
  a: 65,
  d: 68,
  s: 83,
  w: 87,
  x: 88,
};

class Player {
  constructor({ x, y }, id) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.id = id;
    this.size = 40;
    this.mass = 10;
    this.borderWidth = 2;
    this.turningDynamic = 0.2;
  }

  reset({ x, y }) {
    this.pos.x = x;
    this.pos.y = y;
    this.vel = createVector(0, 0);
  }

  getPlayerColor() {
    return this.isRed() ? colors.redTeam : colors.blueTeam;
  }

  isRed() {
    return this.id === 1;
  }

  isBlue() {
    return this.id === 2;
  }

  draw() {
    fill(this.getPlayerColor());
    strokeWeight(this.borderWidth);
    stroke(
      (this.isRed() && keyIsDown(KEY_CODES.x)) || (this.isBlue() && keyIsDown(KEY_CODES.space)) ? colors.light : colors.dark,
    );
    ellipse(this.pos.x, this.pos.y, this.size);
    stroke(colors.dark);
  }

  listenOnBorderTouch() {
    if (this.pos.x > 380) this.pos.x = 380;
    if (this.pos.x < -380) this.pos.x = -380;
    if (this.pos.y > 180) this.pos.y = 180;
    if (this.pos.y < -180) this.pos.y = -180;
  }

  control() {
    if (this.isRed()) {
      if (keyIsDown(KEY_CODES.w)) this.vel.add(createVector(0, -this.turningDynamic));
      if (keyIsDown(KEY_CODES.s)) this.vel.add(createVector(0, this.turningDynamic));
      if (keyIsDown(KEY_CODES.a)) this.vel.add(createVector(-this.turningDynamic, 0));
      if (keyIsDown(KEY_CODES.d)) this.vel.add(createVector(this.turningDynamic, 0));
      this.vel.limit(2);
    } else {
      if (keyIsDown(UP_ARROW)) this.vel.add(createVector(0, -this.turningDynamic));
      if (keyIsDown(DOWN_ARROW)) this.vel.add(createVector(0, this.turningDynamic));
      if (keyIsDown(LEFT_ARROW)) this.vel.add(createVector(-this.turningDynamic, 0));
      if (keyIsDown(RIGHT_ARROW)) this.vel.add(createVector(this.turningDynamic, 0));
      this.vel.limit(2);
    }
  }

  render() {
    this.control();
    this.listenOnBorderTouch();
    this.draw();
  }
}

class Ball {
  constructor({ x, y }) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = 20;
    this.resistanceForce = 50;
  }

  addSpeed() {
    this.vel.limit(7);
  }

  keepCurrentSpeed() {
    this.vel.limit(1);
  }

  kick() {
    this.pos.add(this.vel);
  }

  reset() {
    this.pos.x = 0;
    this.pos.y = 0;
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }

  applyAirResistance() {
    this.air_resitance_v = createVector(this.vel.x / this.resistanceForce, this.vel.y / this.resistanceForce);
    this.vel.sub(this.air_resitance_v);
  }

  handleBounce() {
    const ballTouchesHorizontalBorders = this.pos.x >= 380 || this.pos.x <= -380;
    const ballTouchesVerticalBorders = this.pos.y >= 180 || this.pos.y <= -180;

    if (ballTouchesHorizontalBorders) {
      if (this.pos.x > 380) this.pos.x = 380;
      if (this.pos.x < -380) this.pos.x = -380;
      this.vel.x = this.vel.x * -1;
    }

    if (ballTouchesVerticalBorders) {
      if (this.pos.y > 180) this.pos.y = 180;
      if (this.pos.y < -180) this.pos.y = -180;
      this.vel.y = this.vel.y * -1;
    }
  }

  render() {
    this.handleBounce();
    fill(colors.light);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class Goal {
  constructor({ x, y, width }) {
    this.pos = createVector(x, y);
    this.width = width;
    this.size = 20;
  }

  render() {
    fill(colors.light);
    ellipse(this.pos.x, this.pos.y, this.size);
    ellipse(this.pos.x, this.pos.y - this.width, this.size);
  }
}

class Scorer {
  constructor(redTeamPoints, blueTeamPoints) {
    this.redTeamPoints = redTeamPoints;
    this.blueTeamPoints = blueTeamPoints;
  }

  handleGoal() {
    this.displayScore();
    this.switchBorderLight();
    setTimeout(() => {
      players.forEach((player) => player.reset({ x: player.id === 1 ? -100 : 100, y: 0 }));
      ball.reset();
      this.switchBorderLight();
    }, 1000);
  }

  listenForGoals() {
    const isGoalForRed = ball.pos.x > 380 && ball.pos.y > -100 && ball.pos.y < 100;
    const isGoalForBlue = ball.pos.x < -380 && ball.pos.y > -100 && ball.pos.y < 100;

    if (isGoalForRed) {
      this.addPointForRedTeam();
      this.handleGoal();
    }

    if (isGoalForBlue) {
      this.addPointForBlueTeam();
      this.handleGoal();
    }
  }

  switchBorderLight() {
    document.querySelector("canvas").classList.toggle("goal");
  }

  displayScore() {
    document.querySelector(".score").innerText = `${this.redTeamPoints}:${this.blueTeamPoints}`;
  }

  addPointForRedTeam() {
    this.redTeamPoints++;
  }

  addPointForBlueTeam() {
    this.blueTeamPoints++;
  }
}

class Game {
  render() {
    players.forEach((player) => player.render());
    goals.forEach((goal) => goal.render());
    ball.render();
  }

  listenForBallContact() {
    players.forEach((player) => {
      let player_ball_vector = p5.Vector.sub(ball.pos, player.pos);
      let player_ball_distance = player_ball_vector.mag();

      const hasPlayerContactWithBall = player_ball_distance <= player.size / 2 + ball.size / 2;

      if (hasPlayerContactWithBall) {
        ball.acc = player_ball_vector;
        ball.vel.add(ball.acc);

        const redPlayerKickedBall = keyIsDown(KEY_CODES.x) && player.id === 1;
        const bluePlayerKickedBall = keyIsDown(KEY_CODES.space) && player.id === 2;

        const isBallKicked = redPlayerKickedBall || bluePlayerKickedBall;
        isBallKicked ? ball.addSpeed() : ball.keepCurrentSpeed();
      }

      ball.kick();
    });
  }
}

function setup() {
  createCanvas(800, 400);

  game = new Game();
  players = [new Player({ x: -100, y: 0 }, 1), new Player({ x: 100, y: 0 }, 2)];
  goals = [new Goal({ x: -380, y: 100, width: 200 }), new Goal({ x: 380, y: 100, width: 200 })];
  ball = new Ball({ x: 0, y: 0 });
  scorer = new Scorer(0, 0);
}

const playerFrictionForce = 20;

function draw() {
  background(colors.pitch);
  translate(width / 2, height / 2);

  game.render();
  game.listenForBallContact();
  scorer.listenForGoals();
  ball.applyAirResistance();

  players.forEach((player) => {
    player.friction = createVector(player.vel.x / playerFrictionForce, player.vel.y / playerFrictionForce);
    player.vel.sub(player.friction);
    player.pos.add(player.vel);
  });
}
