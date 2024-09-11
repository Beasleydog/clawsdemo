import takePicture from "../../../camera/takePicture";

const takePictureAbility = {
  name: "Take Picture",
  token: "<TAKE_PICTURE>",
  description: "Take a picture with the camera",
  whenToUse: "When the user has requested that you take a picture.",
  handler: async () => {
    const image = await takePicture();
    const link = document.createElement("a");
    link.href = image;
    link.download = "captured_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default takePictureAbility;
