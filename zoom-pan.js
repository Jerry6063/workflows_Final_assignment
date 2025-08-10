let canvas;

function setup() {
  const container = document.getElementById('canvas-container-3');
  const w = container.offsetWidth;
  const h = 400;

  canvas = createCanvas(w, h, WEBGL);
  canvas.parent('canvas-container-3');

  angleMode(DEGREES);
  strokeWeight(5);
  noFill();
  stroke(32, 8, 64); // Morandi-inspired dark purple

  describe(
    'Users can click on the screen and drag to adjust their perspective in 3D space. The space contains a sphere of dark purple ellipsoids on a light pink background.'
  );
}

function draw() {
  background(250, 180, 200); // Morandi-style soft pink

  if (canvas.elt.matches(':hover')) {
    orbitControl(); // Only enable orbit control when mouse is over canvas
  }

  // Render a sphere structure made of ellipsoids
  for (let zAngle = 0; zAngle < 180; zAngle += 30) {
    for (let xAngle = 0; xAngle < 360; xAngle += 30) {
      push();
      rotateZ(zAngle);
      rotateX(xAngle);
      translate(0, 400, 0);
      ellipsoid();
      pop();
    }
  }
}

// Make canvas responsive on window resize
function windowResized() {
  const container = document.getElementById('canvas-container-3');
  const w = container.offsetWidth;
  const h = 400;
  resizeCanvas(w, h);
}
