import { Ability } from "../types";
import takePictureAsDataUrl from "../../../camera/takePicture";

const takePictureAbility: Ability = {
  name: "Take Picture",
  token: "TAKE_PICTURE",
  description: "Take a picture with the camera",
  whenToUse: "When the user has requested that you take a picture.",
  handler: () => {
    takePictureAsDataUrl().then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "picture.png";
      a.click();
    });
  },
};

export default takePictureAbility;
