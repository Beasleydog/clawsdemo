export interface Ability {
  name: string;
  token: string;
  description: string;
  whenToUse: string;
  handler: (
    param?: string, // {{ edit_1 }} Made 'param' optional
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => void;
}

export interface Todo {
  id: number;
  task: string;
  completed: boolean;
}
