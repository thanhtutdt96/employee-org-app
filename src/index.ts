import { EmployeeOrgApp } from './implementation/EmployeeOrgApp';
import { Employee } from './interfaces/Employee';
import { CommandAction, CommandAnswer } from './interfaces/Common';

const util = require('util');
const figlet = require('figlet');
const inquirer = require('inquirer');

const ceo: Employee = {
  uniqueId: 1,
  name: 'Mark Zuckerberg',
  subordinates: [],
};

ceo.subordinates.push(
  {
    uniqueId: 2,
    name: 'Sarah Donald',
    subordinates: [
      {
        uniqueId: 6,
        name: 'Cassandra Reynolds',
        subordinates: [
          {
            uniqueId: 7,
            name: 'Mary Blue',
            subordinates: [],
          },
          {
            uniqueId: 8,
            name: 'Bob Saget',
            subordinates: [
              {
                uniqueId: 9,
                name: 'Tina Teff',
                subordinates: [
                  {
                    uniqueId: 10,
                    name: 'Will Turner',
                    subordinates: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    uniqueId: 3,
    name: 'Tyler Simpson',
    subordinates: [
      {
        uniqueId: 11,
        name: 'Harry Tobs',
        subordinates: [
          {
            uniqueId: 14,
            name: 'Thomas Brown',
            subordinates: [],
          },
        ],
      },
      {
        uniqueId: 12,
        name: 'George Carrey',
        subordinates: [],
      },
      {
        uniqueId: 13,
        name: 'Gary Styles',
        subordinates: [],
      },
    ],
  },
  {
    uniqueId: 4,
    name: 'Bruce Willis',
    subordinates: [],
  },
  {
    uniqueId: 5,
    name: 'Georgina Flangy',
    subordinates: [
      {
        uniqueId: 15,
        name: 'Sophie Turner',
        subordinates: [],
      },
    ],
  },
);

const organisation = new EmployeeOrgApp(ceo);

console.log(figlet.textSync("Employee Org"));

const questions = [
  {
    type: 'list',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      CommandAction.MOVE,
      CommandAction.UNDO,
      CommandAction.REDO,
      CommandAction.PRINT,
    ],
  },
  {
    type: 'input',
    name: 'employee_id',
    message: 'Enter employee id',
    validate(input: string) {
      if (/^\d+$/.test(input)) {
        return true;
      }

      throw new Error('Please enter valid number');
    },
    when(answer: Record<string, string>) {
      return answer.action === CommandAction.MOVE;
    },
  },
  {
    type: 'input',
    name: 'supervisor_id',
    message: 'Enter supervisor id',
    validate(input: string) {
      if (/^\d+$/.test(input)) {
        return true;
      }

      throw new Error('Please enter valid number');
    },
    when(answer: CommandAnswer) {
      return answer.action === CommandAction.MOVE && answer.employee_id;
    },
  },
];

const printResult = (result: Employee) => {
  console.log(util.inspect(organisation.ceo, {
    showHidden: false,
    depth: null,
    colors: true,
  }));
};

const promptHandler = () => {
  inquirer
    .prompt(questions)
    .then((answer: CommandAnswer) => {
      switch (answer.action) {
        case CommandAction.MOVE:
          organisation.move(+answer.employee_id, +answer.supervisor_id);
          printResult(organisation.ceo);

          break;

        case CommandAction.UNDO:
          organisation.undo();
          printResult(organisation.ceo);

          break;

        case CommandAction.REDO:
          organisation.redo();
          printResult(organisation.ceo);

          break;

        case CommandAction.PRINT:
          printResult(organisation.ceo);

          break;
      }

      promptHandler();
    }).catch((error: Record<string, string>) => {
    console.error(error.message);

    promptHandler();
  });
}

promptHandler();
