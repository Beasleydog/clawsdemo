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
    const id = parseInt(param, 10);
    if (!isNaN(id)) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  },
};

export default removeTodoAbility;
