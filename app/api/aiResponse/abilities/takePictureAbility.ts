import { Ability } from "../types";
import takePicture from "../../../camera/takePicture";

const takePictureAbility: Ability = {
  name: "Take Picture",
  token: "<TAKE_PICTURE>",
  description: "Take a picture with the camera",
  whenToUse: "When the user has requested that you take a picture.",
  handler: (
    param?: string, // {{ edit_1 }} Make 'param' optional
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => {
    // 'param' is ignored for this ability
    takePicture();
  },
};

export default takePictureAbility;
