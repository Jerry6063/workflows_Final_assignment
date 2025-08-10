// Drawing Lines Sketch - using p5.js instance mode
var sketch2 = function(p) {
  let hue = 0; // 色相变量用于彩虹渐变

  p.setup = function() {
    // 创建画布并挂载到页面指定容器
    var canvas = p.createCanvas(800, 400);
    canvas.parent('canvas-container-2');

    p.background(0); // 黑色背景
    p.colorMode(p.HSB, 360, 100, 100); // 使用 HSB 模式便于色彩渐变控制
  };

  p.draw = function() {
    // 不清除背景，保留已绘制的线条
  };

  p.mouseDragged = function() {
    // 拖动鼠标时绘制彩色线条
    p.stroke(hue, 80, 80);
    p.strokeWeight(2);
    p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);

    hue = (hue + 1) % 360; // 色相在360度色环中循环
  };
};

// 创建 p5 实例并挂载到 canvas-container-2
var myp5_2 = new p5(sketch2, 'canvas-container-2');
