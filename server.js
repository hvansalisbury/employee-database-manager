const inquirer = require('inquirer');
const db = require('./modules/root');
const title = require('./modules/title');
let departmentsArray = [];
let departmentsObject = [];
let titlesArray = [];
let rolesObject = [];
let managersArray = [];
let newEmp = [];
let employeesArray = [];
let employeeUpdate = [];

const departmentChoices = () => {
    departmentsArray = [];
    db.query('SELECT * FROM departments ORDER BY id;', function (err, results) {
        departmentsObject = results;
        for (let i = 0; i < results.length; i++) {
            departmentsArray.push(results[i].Department);
        };
    });
};

const titleChoices = () => {
    titlesArray = [];
    db.query('SELECT * FROM roles ORDER BY id;', function (err, results) {
        if (err) {
            console.error(err)
        } else {
            for (let i = 0; i < results.length; i++) {
                titlesArray.push(results[i].Title);
            }
        };
    });
};

const managerChoices = () => {
    managersArray = [];
    db.query('SELECT * FROM employees WHERE manager_id IS NULL ORDER BY id;', function (err, results) {
        for (let i = 0; i < results.length; i++) {
            let fn = results[i].first_name
            let ln = results[i].last_name
            managersArray.push(`${fn} ${ln}`);
        };
        managersArray.push("NONE")
    });
};

const employeeChoices = () => {
    employeesArray = [];
    db.query('SELECT first_name, last_name FROM employees ORDER BY id;', function (err, results) {
        for (let i = 0; i < results.length; i++) {
            let fn = results[i].first_name
            let ln = results[i].last_name
            employeesArray.push(`${fn} ${ln}`);
        };
    });
};

const validateInput = (input) => {
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
        init();
    });
};

const allRoles = () => {
    db.query(`SELECT roles.id as ID, roles.Title as Title, departments.Department AS Department, roles.Salary as Salary
    FROM roles
    JOIN departments ON roles.department_id = departments.id;`, function (err, results) {
        console.table(results);
        init();
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
        init();
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
                choices: departmentsArray,
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
    console.log(newEmp.length + "hello")
    let sql;
    if (newEmp.length === 3) {
        sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES  (?, ?, ?, NULL)`;
    } else {
        sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES  (?, ?, ?, ?)`;
    }
    db.query(sql, newEmp, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            allEmployees();
        }
    });

};

const addEmployeeManager = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "manager",
                message: "Manager of new employee",
                choices: managersArray,
            }
        ])
        .then((answers) => {
            if (answers.manager === "NONE") {
                addEmployee()
            } else {
                const splitName = answers.manager.split(" ");
                const sql = `SELECT id FROM employees WHERE employees.first_name = ? AND employees.last_name = ?`;
                db.query(sql, splitName, function (err, results) {
                    if (err) {
                        console.error(err)
                    } else {
                        newEmp.push(results[0].id)
                        addEmployee();
                    }
                })
            }
        });
};

const addEmployeeRole = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "title",
                message: "Title of new employee",
                validate: validateInput,
                choices: titlesArray,
            },
        ])
        .then((answers) => {
            db.query(`SELECT id FROM roles WHERE roles.Title = ?`, answers.title, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    newEmp.push(results[0].id)
                    addEmployeeManager();
                }
            })
        });
};

const addEmployeeName = () => {
    titleChoices();
    newEmp = [];
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
        ])
        .then((answers) => {
            newEmp.push(answers.first_name, answers.last_name);
            addEmployeeRole();
        });
};

const removeEmployee = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to remove?",
                choices: employeesArray,
            },
        ])
        .then((answers) => {
            console.log(answers.employee)
            const splitName = answers.employee.split(" ");
            const sql = `DELETE FROM employees WHERE first_name = ? AND last_name = ?;`;
            db.query(sql, splitName, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    allEmployees();
                    init();
                }
            })

        });
};


const updateEmployee = () => {
    let sql;
    if (employeeUpdate.length === 2) {
        sql = `UPDATE employees SET role_id = ?, manager_id = NULL WHERE id = ?`;
    } else {
        sql = `UPDATE employees SET role_id = ?, manager_id = ? WHERE id = ?`;
    }
    db.query(sql, employeeUpdate, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            allEmployees();
        }
    });
};

const newManager = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "manager",
                message: "New manager of employee",
                choices: managersArray,
            }
        ])
        .then((answers) => {
            if (answers.manager === "NONE") {
                updateEmployee()
            } else {
                const splitName = answers.manager.split(" ");
                const sql = `SELECT id FROM employees WHERE employees.first_name = ? AND employees.last_name = ?`;
                db.query(sql, splitName, function (err, results) {
                    if (err) {
                        console.error(err)
                    } else {
                        let managerID = parseInt(results[0].id);
                        employeeUpdate.splice(1, 0, managerID)
                        updateEmployee();
                    }
                })
            }
        });
};

const newTitle = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "title",
                message: "New title of employee",
                choices: titlesArray,
            },
        ])
        .then((answers) => {
            let roleID = titlesArray.indexOf(answers.title);
            roleID = roleID + 1;
            employeeUpdate.unshift(roleID)
            newManager();
        });
};

const selectEmployee = () => {
    employeeUpdate = [];
    inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to update?",
                choices: employeesArray,
            },
        ])
        .then((answers) => {
            const splitName = answers.employee.split(" ");
            const sql = `SELECT id FROM employees WHERE employees.first_name = ? AND employees.last_name = ?`;
            db.query(sql, splitName, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    employeeUpdate.push(parseInt(results[0].id))
                    newTitle()
                }
            })
        });
};

const init = () => {
    departmentChoices()
    titleChoices()
    managerChoices()
    employeeChoices()
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'first',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Remove Employee', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
            }
        ])
        .then((answers) => {
            switch (answers.first) {
                case 'View All Employees':
                    allEmployees();
                    break;
                case 'Add Employee':
                    addEmployeeName();
                    break;
                case 'Update Employee Role':
                    selectEmployee();
                    break;
                case 'Remove Employee':
                    removeEmployee();
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