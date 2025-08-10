// 2D Drawing Sketch - using p5.js instance mode
var sketch1 = function(p) {
  // All variables are scoped to this instance
  var canvasWidth = 800;
  var canvasHeight = 400;
  var gridSpacing = 40;
  var canvas;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-1');
  };

  p.draw = function() {
    p.background(250);
    drawGrid();
    drawPrimitives();
  };

  function drawGrid() {
    p.stroke(200);
    p.strokeWeight(1);
    for (var x = 0; x <= p.width; x += gridSpacing) {
      p.line(x, 0, x, p.height);
    }
    for (var y = 0; y <= p.height; y += gridSpacing) {
      p.line(0, y, p.width, y);
    }
  }

  function drawPrimitives() {
  // Hexagon
  p.fill(186, 183, 168); // 莫兰迪米灰
  p.beginShape();
  let cx1 = 150, cy1 = 100, r1 = 50;
  for (let i = 0; i < 6; i++) {
    let angle = p.TWO_PI / 6 * i;
    let x = cx1 + r1 * p.cos(angle);
    let y = cy1 + r1 * p.sin(angle);
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);

  // Pentagon
  p.fill(168, 181, 191); // 莫兰迪蓝灰
  p.beginShape();
  let cx2 = 350, cy2 = 100, r2 = 45;
  for (let i = 0; i < 5; i++) {
    let angle = p.TWO_PI / 5 * i - p.HALF_PI;
    let x = cx2 + r2 * p.cos(angle);
    let y = cy2 + r2 * p.sin(angle);
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);

  // Crescent (using two overlapping ellipses)
  p.noStroke();
  p.fill(209, 192, 183); // 莫兰迪粉棕
  p.ellipse(550, 120, 90, 90);
  p.fill(255); // 背景白色“切掉”部分
  p.ellipse(570, 120, 90, 90);

  // Line connecting them
  p.stroke(120, 130, 140); // 莫兰迪深灰蓝
  p.strokeWeight(3);
  p.line(150, 100, 350, 100);
  p.line(350, 100, 550, 120);
  }
};

// Create the instance
var myp5_1 = new p5(sketch1, 'canvas-container-1'); 