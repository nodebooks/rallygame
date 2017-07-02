var Bubble = function(canvas, x, y, radius) {
  this.canvas = canvas || document.getElementById('myCanvas');
  this.radius = parseInt(Number(radius)) || 8;
  this.mass = 0.1;
  this.speed = 0;

  this.r = Math.floor(Math.random()*255);
  this.g = Math.floor(Math.random()*255);
  this.b = Math.floor(Math.random()*255);
  this.a = 0.8;

  this.x = parseInt(Number(x)) || getRandomInt(this.canvas.width);
  this.y = parseInt(Number(y)) || getRandomInt(this.canvas.height);

  this.mousex = this.canvas.width/2;
  this.mousey = this.canvas.height/2;
};

Bubble.prototype.bindPlayer = function(name, speed) {
  this.name = name;
  this.speed = speed;

  var self = this;
  document.addEventListener('mousemove', function(evt) {
    console.log("mouse-event", self);
    self.mousex = evt.clientX;
    self.mousey = evt.clientY;

    //console.log("evt:", evt);
    //var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
  }, false);
};

Bubble.prototype.move = function(self) {
  // Set direction
  if (self.mousex >= self.x) {
    self.x += self.speed;
  }
  else {
    self.x -= self.speed;
  }
  if (self.mousey >= self.y) {
    self.y += self.speed;
  }
  else {
    self.y -= self.speed;
  }

};

Bubble.prototype.render = function(self) {
  ctx.beginPath();
  ctx.arc(self.x,self.y,self.radius,Math.PI*2,0,true);
  ctx.fillStyle = "rgba(" + self.r + "," +
                            self.g + "," +
                            self.b + ",0.8)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  //ctx.closePath();

};

function getRandomInt (number) {
  var num = parseInt(number);
  if(num > 1) {
    return Math.floor(Math.random()*num)+1;
  }
  else {
    return 0;
  }
}

var Gameboard = function(canvas, ctx) {
  this.width = canvas.width;
  this.height = canvas.height;
};

var Camera = function(object, viewWidth, viewHeight, mapWidth, mapHeight) {
  this.follows = object;

  // Set initial camera position to object location (x,y)
  this.xPos = object.x;
  this.yPos = object.y;

  // view around object that is followed
  this.viewWidth = viewWidth;
  this.viewHeight = viewHeight;

};
