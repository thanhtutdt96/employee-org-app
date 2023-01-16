export interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

export interface ActionHistory {
  description: string;
  undo(): void;
  redo(): void;
}

export interface ChangeSupervisorResult {
  oldSupervisor?: Employee;
  oldSubordinatesIds?: number[];
}
