import { ActionHistory, ChangeSupervisorResult, Employee } from '../interfaces/Employee';
import { IEmployeeOrgApp } from '../interfaces/IEmployeeOrgApp';

export class EmployeeOrgApp implements IEmployeeOrgApp {
  public ceo: Employee;
  public flatList: Employee[] = [];
  public currentActionIndex: number;
  public actionHistory: ActionHistory[];

  constructor(ceo: Employee) {
    this.ceo = ceo;
    this.currentActionIndex = 0;
    this.actionHistory = [];
    this.updateFlatList();
  }

  public find(...ids: number[]) {
    const result: Employee[] = [];

    const filtered = this.flatList.filter(({ uniqueId }) => ids.includes(uniqueId));

    ids.forEach((id) => {
      const employee = filtered.find(({ uniqueId }) => uniqueId === id);

      if (!employee) {
        return;
      }

      result.push(employee);
    });

    return result;
  }

  private registerAction(
    employee: Employee,
    supervisor: Employee,
    oldSupervisor?: Employee,
    oldSubordinates?: number[],
  ) {
    if (oldSupervisor && oldSubordinates) {
      if (this.currentActionIndex < this.actionHistory.length) {
        this.actionHistory.splice(this.currentActionIndex);
      }

      this.actionHistory.push({
        description: `Change Supervisor of ${employee.name} from ${oldSupervisor.name} to ${supervisor.name}`,
        undo: () => {
          this.changeSupervisor(employee, oldSupervisor);

          if (oldSubordinates.length) {
            employee.subordinates = this.find(...oldSubordinates);

            oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
              (subordinate) => !oldSubordinates.includes(subordinate.uniqueId),
            );
          }
        },
        redo: () => {
          this.changeSupervisor(employee, supervisor);
        },
      });

      this.currentActionIndex++;
    }
  }

  private changeSupervisor(employee: Employee, newSupervisor: Employee): ChangeSupervisorResult {
    let result: ChangeSupervisorResult = {};

    for (let i = 0, j = this.flatList.length; i < j; i++) {
      const supervisor = this.flatList[i];

      const supervisorSubordinates = supervisor.subordinates;
      const employeeSubordinates = employee.subordinates;

      if (this.isSupervisorOf(employee, newSupervisor)) {
        throw new Error(`The employee ${employee.name} is supervisor of ${newSupervisor.name}`);
      }

      const matchedEmployee = supervisorSubordinates.find(
        ({ uniqueId }) => uniqueId === employee.uniqueId,
      );

      if (matchedEmployee) {
        if (supervisor.uniqueId === newSupervisor.uniqueId) {
          throw new Error(
            `The employee ${employee.uniqueId} it already subordinate of ${newSupervisor.uniqueId}`,
          );
        }

        supervisor.subordinates = supervisorSubordinates.filter(
          ({ uniqueId }) => uniqueId !== employee.uniqueId,
        );

        if (employeeSubordinates.length) {
          employeeSubordinates.forEach((subordinate) => {
            supervisor.subordinates.push(subordinate);
          });
        }

        result = {
          oldSupervisor: supervisor,
          oldSubordinatesIds: employeeSubordinates.map((subordinate) => subordinate.uniqueId),
        };

        employee.subordinates = [];
        newSupervisor.subordinates.push(employee);

        break;
      }
    }

    return result;
  }

  public isSupervisorOf(employee: Employee, newSupervisor: Employee): boolean {
    const subordinates = employee.subordinates;

    let matched = subordinates.some((subordinate) => subordinate.uniqueId === newSupervisor.uniqueId);

    if (matched) {
      return true;
    }

    for (let i = 0, j = subordinates.length; i < j; i++) {
      matched = this.isSupervisorOf(subordinates[i], newSupervisor);

      if (matched) {
        return true;
      }
    }

    return false;
  }

  private updateFlatList(): void {
    this.flatList = [...this.flattenSubordinates(), this.ceo];
  }

  private flattenSubordinates(employee: Employee = this.ceo): Employee[] {
    let flatList = employee.subordinates.flat();

    employee.subordinates.forEach(
      (subordinate) => (flatList = flatList.concat(this.flattenSubordinates(subordinate))),
    );

    return flatList;
  }

  public move(employeeID: number, supervisorID: number) {
    if (employeeID === this.ceo.uniqueId) {
      throw new Error('The CEO cannot be a subordinate');
    }

    if (employeeID === supervisorID) {
      throw new Error(
        `Employee and Supervisor cannot be the same, Employee:${employeeID}, Supervisor:${supervisorID}`,
      );
    }

    const [employee, supervisor] = this.find(employeeID, supervisorID);

    if (!employee) {
      throw new Error(`Employee ${employeeID} does not exist`);
    }
    if (!supervisor) {
      throw new Error(`Employee ${supervisorID} does not exist`);
    }

    const { oldSupervisor, oldSubordinatesIds } = this.changeSupervisor(employee, supervisor);

    this.registerAction(employee, supervisor, oldSupervisor, oldSubordinatesIds);
  }

  public undo() {
    if (this.currentActionIndex <= 0) {
      return;
    }

    this.currentActionIndex--;
    this.actionHistory[this.currentActionIndex].undo();
  }

  public redo() {
    if (this.currentActionIndex >= this.actionHistory.length) {
      return;
    }

    this.actionHistory[this.currentActionIndex].redo();
    this.currentActionIndex++;
  }
}
