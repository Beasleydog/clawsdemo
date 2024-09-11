import takePicture from "../../../camera/takePicture";

const takePictureAbility = {
  name: "Take Picture",
  token: "<TAKE_PICTURE>",
  description: "Take a picture with the camera",
  whenToUse: "When the user has requested that you take a picture.",
  handler: async () => {
    const image = await takePicture();
    const imageEl = new Image();
    imageEl.src = image;
    document.body.appendChild(imageEl);
  },
};

export default takePictureAbility;
