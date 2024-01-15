let capture;
let button;
let webcamImage;
let data;
let cluster;
let isDoing;
let colorLabel;
let colorSlider;
let colorOutput;
let pauseButton;
let paused;

function setup() {
  createCanvas(320, 240);
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();
  isDoing = false;

  button = createButton("Compress image");
  button.mousePressed(usePhoto);
  colorLabel = createSpan("Colors: ");
  colorSlider = createSlider(2, 32, 8, 1);
  colorOutput = createSpan(colorSlider.value());

  paused = false;
  pauseButton = createButton("Pause/Play");
  pauseButton.mousePressed(() => {
    paused ? loop() : noLoop();
    paused = !paused;
  });


  colorSlider.elt.oninput = () => colorOutput.elt.textContent = colorSlider.value();
}

function usePhoto() {
  capture.remove();
  loadPixels();
  data = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (x + (width * y)) * 4;
      data.push(pixels.slice(index, index + 3));
    }
  }
  cluster = new Cluster(data, colorSlider.value());
  isDoing = true;
}

function draw() {
  if (isDoing) {
    loadPixels();
    cluster.classifyData();
    cluster.moveCentroids();
    // For each data point
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (x + (width * y)) * 4;
        const groupColor = cluster.centroids[cluster.groupIndices[index / 4]];
        pixels[index] = groupColor[0];
        pixels[index + 1] = groupColor[1];
        pixels[index + 2] = groupColor[2];
        pixels[index + 3] = 255;
      }
    }
    updatePixels();
  } else {
    image(capture, 0, 0, 320, 240);

  }
}