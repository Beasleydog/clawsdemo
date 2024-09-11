async function takePictureAsDataUrl(): Promise<string> {
  console.log("Starting takePictureAsDataUrl function");
  try {
    console.log("Requesting camera access");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Camera access granted");

    const track = stream.getVideoTracks()[0];
    console.log("Capturing image");
    const imageCapture = new (window as any).ImageCapture(track);
    const blob = await imageCapture.takePhoto();
    console.log("Image captured");

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    console.log("Data URL created");

    track.stop();
    console.log("Stopped video track");

    return dataUrl;
  } catch (error) {
    console.error("Error in takePictureAsDataUrl:", error);
    throw error;
  }
}

export default takePictureAsDataUrl;
