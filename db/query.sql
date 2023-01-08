SELECT * FROM departments;
SELECT * FROM roles;
SELECT * FROM employees;

SELECT roles.id as ID, roles.Title as Title, departments.Department AS Department, roles.Salary as Salary
FROM roles
JOIN departments ON roles.department_id = departments.id;

SELECT e.id AS ID, CONCAT(e.first_name, " " , e.last_name) AS Employee, roles.Title AS Title, departments.Department AS Department, roles.Salary AS Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
FROM employees e
JOIN roles ON e.role_id = roles.id
JOIN departments ON roles.department_id = departments.id
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;