const videoElement = document.getElementById("video");
const resultElement = document.getElementById("result");
async function setupCamera() {
  const constraints = {
    video: { width: 640, height: 480 },
  };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(videoElement);
      };
    });
  }

  return null;
}

async function run() {
  const URL = "https://teachablemachine.withgoogle.com/models/YDrxrSxDO/"; // Replace with your model's URL
  const model = await tmImage.load(URL + "model.json", URL + "metadata.json");
  let maxPredictions = model.getTotalClasses();

  await setupCamera();
  videoElement.play();

  setInterval(async () => {
    const prediction = await model.predict(videoElement);

    // Get the top prediction
    console.log(prediction);
    const maxxValue = Math.max(
      prediction[0].probability,
      prediction[1].probability,
      prediction[2].probability
    );
    console.log(maxxValue);
    const topPrediction = prediction[0];

    // Display the label and probability
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    }

    // Update the predefined text based on the prediction
    let text = "";
    if (topPrediction.className === "person with mobile") {
      text = "A mobile is good to carry";
    } else {
      // Add more cases for other classes if needed
      text = "Predefined text for other classes";
    }

    // Display the predefined text
    // Replace 'predefined-text-element' with the actual element ID where you want to display the text
    document.getElementById("predefined-text-element").innerText = text;
  }, 100);
}

run();
