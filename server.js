// npm inquirer to interact in command line, root file to interact with mysql data, and title graphic
const inquirer = require('inquirer');
const db = require('./application/root');
const title = require('./application/title');
// declare variables to be used in multiple functions
let departmentsArray = [];
let departmentsObject = [];
let titlesArray = [];
let rolesObject = [];
let managersArray = [];
let newEmp = [];
let employeesArray = [];
let employeeUpdate = [];
let managerID = '';
// display the title graphic
title.header();
// function to make an array of the departments for inquirer list options
const departmentChoices = () => {
    departmentsArray = [];
    db.query('SELECT * FROM departments ORDER BY id;', function (err, results) {
        departmentsObject = results;
        for (let i = 0; i < results.length; i++) {
            departmentsArray.push(results[i].Department);
        };
    });
};
// function to make an array of the titles for inquirer list options
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
// function to make an array of the managers for inquirer list options
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
// function to make an array of the employees for inquirer list options
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
// function to make an sure no blank values are submitted
const validateInput = (input) => {
    if (input !== '') {
        return true;
    } else {
        console.log('This field does not accept blank values, press up and delete previous entry');
        return false;
    };
};
// function to display all departments as a table
const allDepartments = () => {
    db.query(`SELECT * FROM departments;`, function (err, results) {
        console.table(results);
        init();
    });
};
// function to display all roles as a table
const allRoles = () => {
    db.query(`SELECT roles.id as ID, roles.Title as Title, departments.Department AS Department, roles.Salary as Salary
    FROM roles
    JOIN departments ON roles.department_id = departments.id;`, function (err, results) {
        console.table(results);
        init();
    });
};
// function to display all employees as a table
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
// function to add a new department
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
// function to add a new role
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
// function to add a new employee
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
// function to select the manager for the new employee
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
// function to select the role for the new employee
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
// function to enter the name of the new employee
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
// function to to delete an employee from the database
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
                }
            })

        });
};
// function to update the role and manager of an existing employee
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
// function to select a new manager for an existing employee
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
// function to select a new role for an existing employee
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
// function to select the employee that will have a new role and manager
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
// function to udpate the manager of an existing employee
const updateEmployee2 = () => {
    console.log(employeeUpdate)
    let sql;
    if (employeeUpdate.length === 1) {
        sql = `UPDATE employees SET manager_id = NULL WHERE id = ?`;
    } else {
        sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;
    }
    console.log(sql)
    db.query(sql, employeeUpdate, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            allEmployees();
        }
    });
};
// function to select a new manager of an existing employee
const newManager2 = () => {
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
                updateEmployee2()
            } else {
                const splitName = answers.manager.split(" ");
                const sql = `SELECT id FROM employees WHERE employees.first_name = ? AND employees.last_name = ?`;
                db.query(sql, splitName, function (err, results) {
                    if (err) {
                        console.error(err)
                    } else {
                        let managerID = parseInt(results[0].id);
                        employeeUpdate.unshift(managerID)
                        updateEmployee2();
                    }
                })
            }
        });
};
// function to to select the employee that will have a new manager
const selectEmployee2 = () => {
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
                    newManager2()
                }
            })
        });
};
// function to view all employees of a manager
const viewByManager = () => {
    sql = `SELECT 	e.id AS ID, CONCAT(e.first_name, " " , e.last_name) AS Employee, roles.Title, departments.Department, roles.Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
            FROM employees e
            JOIN roles ON e.role_id = roles.id
            JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees m ON m.id = e.manager_id
            WHERE e.manager_id = ?
            ORDER BY e.id;`;

    db.query(sql, managerID, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            console.table(results);
            init();
        }
    })
};
// function to select the manager whose employees we wish to view
const employeesByManager = () => {
    managersArray.length = managersArray.length - 1;
    inquirer
        .prompt([
            {
                type: "list",
                name: "manager",
                message: "Which Manager's employees would you like to view?",
                choices: managersArray,
            }
        ])
        .then((answers) => {
            const splitName = answers.manager.split(" ");
            db.query('SELECT id FROM employees WHERE first_name = ? and last_name = ?;', splitName, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    managerID = results[0].id;
                    viewByManager();
                }
            })
        });
};
// function to view all employees of a department
const viewByDepartment = () => {
    sql = `SELECT 	e.id AS ID, CONCAT(e.first_name, " " , e.last_name) AS Employee, roles.Title, departments.Department, roles.Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
    FROM employees e
    JOIN roles ON e.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees m ON m.id = e.manager_id
    WHERE e.role_id = ? || e.role_id = ?
    ORDER BY e.id;`;

    db.query(sql, titlesArray, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            console.table(results);
            init();
        }
    })
};
// function to select the department whose employees we wish to view
const employeesByDepartment = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "department",
                message: "Which Department's employees would you like to view?",
                choices: departmentsArray,
            }
        ])
        .then((answers) => {
            const department_id = departmentsObject[departmentsArray.indexOf(answers.department)].id;
            const sql = 'SELECT id FROM roles WHERE department_id = ?;';
            db.query(sql, department_id, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    titlesArray = []
                    for (let i = 0; i < results.length; i++) {
                        titlesArray.push(results[i].id)
                    }
                    viewByDepartment();
                }
            })
        });
};
// function to remove a role
const removeRole = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "role",
                message: "Which role would you like to remove?",
                choices: titlesArray,
            },
        ])
        .then((answers) => {
            const roleID = answers.role
            const sql = `DELETE FROM roles WHERE Title = ?;`;
            db.query(sql, roleID, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    allRoles();
                }
            })

        });
};
// function to remove a department
const removeDepartment = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "department",
                message: "Which department would you like to remove?",
                choices: departmentsArray,
            },
        ])
        .then((answers) => {
            const sql = `DELETE FROM departments WHERE Department = ?;`;
            db.query(sql, answers.department, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    allDepartments();
                }
            })

        });
};
// function to view the sum of the salaries in a department
const departmentBudget = () => {
    sql = `SELECT SUM(roles.Salary) AS salaries FROM employees JOIN roles ON role_id = roles.id WHERE role_id = ? || role_id = ?;`;
    db.query(sql, titlesArray, function (err, results) {
        if (err) {
            console.error(err)
        } else {
            console.log(`The total budget is $${results[0].salaries}`);
            init();
        }
    })
};
// function to select the department whose budget we wish to view
const viewBudget = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "department",
                message: "Which department's budget would you like to view?",
                choices: departmentsArray,
            },
        ])
        .then((answers) => {
            const department_id = departmentsObject[departmentsArray.indexOf(answers.department)].id;
            const sql = 'SELECT id FROM roles WHERE department_id = ?;';
            db.query(sql, department_id, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    titlesArray = []
                    for (let i = 0; i < results.length; i++) {
                        titlesArray.push(results[i].id)
                    }
                    departmentBudget();
                }
            })

        });
};
// function to populate all the choices arrays and ask user to pick from a list of options
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
                choices: [
                    'View All Employees',
                    'View Employees By Manager',
                    'View Employees By Department',
                    'Add Employee',
                    'Update Employee Role',
                    'Update Employee Manager',
                    'Remove Employee',
                    'View All Roles',
                    'Add Role',
                    'Remove Role',
                    'View All Departments',
                    'View Department Budget',
                    'Add Department',
                    'Remove Department',
                    'Quit'],
            }
        ])
        .then((answers) => {
            switch (answers.first) {
                case 'View All Employees':
                    allEmployees();
                    break;
                case 'View Employees By Manager':
                    employeesByManager();
                    break;
                case 'View Employees By Department':
                    employeesByDepartment();
                    break;
                case 'Add Employee':
                    addEmployeeName();
                    break;
                case 'Update Employee Role':
                    selectEmployee();
                    break;
                case 'Update Employee Manager':
                    selectEmployee2();
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
                case 'Remove Role':
                    removeRole();
                    break;
                case 'View All Departments':
                    allDepartments();
                    break;
                case 'View Department Budget':
                    viewBudget();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Remove Department':
                    removeDepartment();
                    break;
                case 'Quit':
                    db.end();
                    break;
            }
        });
};
// runs the init function
init();