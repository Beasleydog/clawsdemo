import { Ability } from "../types";

const removeTodoAbility: Ability = {
  name: "Remove Todo",
  token: "REMOVE_TODO",
  description: "Remove a todo item by ID",
  whenToUse: "When the user wants to remove a todo.",
  handler: (
    param: string,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => {
    const id = parseInt(param);
    if (!isNaN(id)) {
      setTodos((prev) => {
        console.log(prev, id);
        return prev.filter((todo) => todo.id !== id);
      });
    }
  },
};

export default removeTodoAbility;
