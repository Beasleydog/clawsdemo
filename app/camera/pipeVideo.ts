export default function pipeVideo(video: HTMLVideoElement) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video
        .play()
        .catch((error) => console.error("Error playing video:", error));
    })
    .catch((error) => console.error("Error accessing camera:", error));
}
