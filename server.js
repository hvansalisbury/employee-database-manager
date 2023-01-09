const inquirer = require('inquirer');
const db = require('./modules/root');
const title = require('./modules/title');
let departmentsArray = [];
let departmentsObject = [];

const departmentChoices = () => {
    departmentsArray = [];
    db.query('SELECT * FROM departments ORDER BY id;', function (err, results) {
        departmentsObject = results;
        for (let i = 0; i < results.length; i++) {
            departmentsArray.push(results[i].Department);
        };
        console.log(departmentsObject)
    });
    return departmentsArray;
};

departmentChoices();

const validateInput = async (input) => {
    if (input !== '') {
        return true;
    } else {
        console.log('This field does not accept blank values, press up and delete previous entry');
        return false;
    };
};

const allDepartments = () => {
    db.query(`SELECT * FROM departments;`, function (err, results) {
        console.table(results);
    });
};

const allRoles = () => {
    db.query(`SELECT roles.id as ID, roles.Title as Title, departments.Department AS Department, roles.Salary as Salary
    FROM roles
    JOIN departments ON roles.department_id = departments.id;`, function (err, results) {
        console.table(results);
    });
};

const allEmployees = () => {
    db.query(`SELECT e.id AS ID, CONCAT(e.first_name, " " , e.last_name) AS Employee, roles.Title, departments.Department, roles.Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
    FROM employees e
    JOIN roles ON e.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees m ON m.id = e.manager_id
    ORDER BY e.id;`, function (err, results) {
        console.table(results);
    });
};

const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What is the name of the new department?",
                validate: validateInput,
            }
        ])
        .then((answers) => {
            const Department = answers.name;
            const sql = `INSERT INTO departments (Department)
            VALUES (?)`;
            db.query(sql, Department, function (err, results) {
                allDepartments();
            });
        });
};

const addRole = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "title",
                message: "Title for new role",
                validate: validateInput,
            },
            {
                type: "number",
                name: "salary",
                message: `Salary for new role`,
                validate: validateInput,
            },
            {
                type: "list",
                name: "department",
                message: `Department of new role`,
                validate: validateInput,
                choices: departmentChoices(),
            }
        ])
        .then((answers) => {
            const department_id = departmentsObject[departmentsArray.indexOf(answers.department)].id;
            const values = [answers.title, answers.salary, department_id];
            console.log(values)
            const sql = `INSERT INTO roles (Title, Salary, department_id) VALUES (?, ?, ?);`;
            db.query(sql, values, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    allRoles();
                };
            });
        });
};

const addEmployee = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "first_name",
                message: "First name of new employee",
                validate: validateInput,
            },
            {
                type: "input",
                name: "last_name",
                message: "Last name of new employee",
                validate: validateInput,
            },
            {
                type: "list",
                name: "salary",
                message: `Salary for new role`,
                validate: validateInput,
            },
            {
                type: "list",
                name: "department",
                message: `Department of new role`,
                validate: validateInput,
                choices: departmentChoices(),
            }
        ])
        .then((answers) => {
            const department_id = departmentsObject[departmentsArray.indexOf(answers.department)].id;
            const values = [answers.title, answers.salary, department_id];
            console.log(values)
            const sql = `INSERT INTO roles (Title, Salary, department_id) VALUES (?, ?, ?);`;
            db.query(sql, values, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    allRoles();
                };
            });
        });
};

const updateRole = () => {
    inquirer
        .prompt([
            {

            }
        ])
        .then((answers) => {
        });
};

const init = () => {
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

init();