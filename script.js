const videoElement = document.getElementById("video");
const resultElement = document.getElementById("result");
const liveStatsElement = document.getElementById("live-stats");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const videoContainer = document.getElementById("video-container");

let model,
  isPredicting = false;
let videoStream;
const constraints = { video: { width: 480, height: 360 } };

async function setupCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = videoStream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(videoElement);
      };
    });
  }
  return null;
}

async function loadModel() {
  const URL = "https://teachablemachine.withgoogle.com/models/YDrxrSxDO/"; // Replace with your model's URL
  model = await tmImage.load(URL + "model.json", URL + "metadata.json");
}

async function predict() {
  while (isPredicting) {
    const prediction = await model.predict(videoElement);

    // Display the live probabilities for all classes
    let liveStats = "";
    prediction.forEach((pred, idx) => {
      liveStats += `<p>${idx + 1}. ${pred.className} : ${Math.round(
        pred.probability * 100
      )}%</p>`;
    });
    liveStatsElement.innerHTML = liveStats;

    // Get the top prediction with the highest probability
    const topPrediction = prediction.reduce((prev, current) => {
      return prev.probability > current.probability ? prev : current;
    });

    if (!isPredicting) {
      // Display only the highest probability class when stopped
      resultElement.innerHTML = `<p>=> ${topPrediction.className}</p>`;
    }
  }
}

function startPrediction() {
  isPredicting = true;
  startButton.disabled = true;
  startButton.classList.add("hidden");
  stopButton.classList.remove("hidden");
  stopButton.disabled = false;
  videoContainer.classList.add("active");
  setupCamera()
    .then(() => {
      videoElement.play();
      predict();
    })
    .catch((error) => console.error("Error accessing camera:", error));
}

function stopPrediction() {
  isPredicting = false;
  startButton.disabled = false;
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
  stopButton.disabled = true;
  videoElement.pause();
  videoElement.srcObject = null;
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
  }
  resultElement.innerText = "";
  liveStatsElement.innerHTML = "";
  videoContainer.classList.remove("active");
}

function run() {
  startButton.addEventListener("click", startPrediction);
  stopButton.addEventListener("click", stopPrediction);
  loadModel().catch((error) => console.error("Error loading model:", error));
}

// Show "Click on Start" initially
videoContainer.classList.remove("active");

run();
