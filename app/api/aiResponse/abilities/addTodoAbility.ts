import { Ability } from "../types";

const addTodoAbility: Ability = {
  name: "Add Todo",
  token: "ADD_TODO",
  description: "Add a todo item",
  whenToUse: "When the user wants to add a new todo.",
  handler: (
    param: string,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => {
    if (param) {
      setTodos((prev) => [
        ...prev,
        { id: Date.now(), task: param, completed: false },
      ]);
    }
  },
};

export default addTodoAbility;
