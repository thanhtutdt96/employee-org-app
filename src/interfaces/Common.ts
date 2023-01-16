export enum CommandAction {
  MOVE = 'Move',
  UNDO = 'Undo',
  REDO = 'Redo',
  PRINT = 'Print',
}

export interface CommandAnswer {
  action: CommandAction;
  employee_id: number;
  supervisor_id: number;
}
