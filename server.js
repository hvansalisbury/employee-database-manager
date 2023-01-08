const inquirer = require('inquirer');
const db = require('./root');


console.log(",---------------------------------------------------,")
console.log("|                                                   |")
console.log("|   _____                 _                         |")
console.log("|  | ____|_ __ ___  _ __ | | ___  _   _  ___  ___   |")
console.log("|  |  _| | '_ ` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\  |")
console.log("|  | |___| | | | | | |_) | | (_) | |_| |  __/  __/  |")
console.log("|  |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|  |")
console.log("|                  |_|            |___/             |")
console.log("|   __  __                                          |")
console.log("|  |  \\/  | __ _ _ __   __ _  __ _  ___ _ __        |")
console.log("|  | |\\/| |/ _` | '_ \\ / _` |/ _` |/ _ \\ '__|       |")
console.log("|  | |  | | (_| | | | | (_| | (_| |  __/ |          |")
console.log("|  |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|          |")
console.log("|                            |___/                  |")
console.log("|                                                   |")
console.log("`---------------------------------------------------'")

const start = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'first',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
            }
        ])
        .then((answers) => {
            switch (answers.first) {
                case 'View All Employees':
                    allEmployees();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateRole();
                    break;
                case 'View All Roles':
                    allRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View All Departments':
                    allDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Quit':
                    db.end();
                    break;
            }
        });
};
