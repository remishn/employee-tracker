const express = require('express')
const mysql = require('mysql2')
const inquirer = require('inquirer')
const cTable = require('console.table')
const { response } = require('express')

require('dotenv').config()

const connection  = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'employee_db'
})

// connection.connect(function(err) {
//   if (err) throw err;

// });

const promptUser = () => {
    inquirer.prompt ([
      {
        type: 'list',
        name: 'choices', 
        message: 'What would you like to do?',
        choices: ['View all departments', 
                  'View all roles', 
                  'View all employees', 
                  'Add a department', 
                  'Add a role', 
                  'Add an employee', 
                  'Update an employee role',
                  'Update an employee manager',
                  "View employees by department",
                  'Delete a department',
                  'Delete a role',
                  'Delete an employee',
                  'View department budgets',
                  'No Action']
      }
    ])

    .then((answers) => {
        const { choices } = answers
  
        if (choices === "View all departments") {
          showDepartments()
        }
  
        if (choices === "View all roles") {
          showRoles()
        }
  
        if (choices === "View all employees") {
          showEmployees()
        }
  
        if (choices === "Add a department") {
          addDepartment()
        }
  
        if (choices === "Add a role") {
          addRole()
        }
  
        if (choices === "Add an employee") {
          addEmployee()
        }
  
        if (choices === "Update an employee role") {
          updateEmployee()
        }
  
        if (choices === "Update an employee manager") {
          updateManager()
        }
  
        if (choices === "View employees by department") {
          employeeDepartment()
        }
  
        if (choices === "Delete a department") {
          deleteDepartment()
        }
  
        if (choices === "Delete a role") {
          deleteRole()
        }
  
        if (choices === "Delete an employee") {
          deleteEmployee()
        }
  
        if (choices === "View department budgets") {
          viewBudget()
        }
  
        if (choices === "No Action") {
          connection.end()
      }
    })
  }

 showDepartments = () => {
    console.log('Showing all departments...\n');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`; 
  
    connection.query(sql, (err, rows) => {
      if (err) throw err
      console.table(rows)
      promptUser()
    })
  }

  // functions to show roles

  showRoles = () => {
    console.log('Showing all roles...\n');
  
    const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;
    
    connection.query(sql, (err, rows) => {
      if (err) throw err
      console.table(rows)
      promptUser()
    })
  };
  
  // function to show all employees 
  showEmployees = () => {
    console.log('Showing all employees...\n')
    const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`
  
    connection.query(sql, (err, rows) => {
      if (err) throw err; 
      console.table(rows);
      promptUser();
    });
  };

  addDepartment = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'addDept',
        message: 'add department'
      }
    ])

    .then(answer => {
      const sql = `INSERT INTO department (name)
                  VALUES (?)`
      connection.query(sql, answer.addDept, (err, response) => {
        if (err) throw err
        console.log(answer.addDept + ' added')

        showDepartments()
      })
    })
  }
    // add role

    addRole = () => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'role',
          message: 'add a role'
        },

        {
          type: 'input',
          name: 'salary',
          message: 'enter salary'
        }
      ])

      .then(answer => {
        const params = [answer.role, answer.salary];

        // from dept table
        const roleSql = `SELECT name, id FROM department`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err

          const dept = data.map(({ name, id }) => ({ name: name, value: id}))

          inquirer.prompt([
            {
              type: 'list',
              name: 'dept',
              message :'choose department',
              choices: dept
            }
          ])

          .then(deptChoice => {
            const dept = deptChoice.dept
            params.push(dept)

            const sql = `INSERT INTO role (title, salary, departmen_id)
            VALUES(?, ?, ?)`;
            connection.query(sql, params, (err, result) => {
              if (err) throw err
              console.log(answer.role + ' added')

              showRoles()
            })
          })
        })
      })
    }

    // add employee

    addEmployee = () => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'firstName',
          message: 'enter first name'
        },
        
        {
          type: 'input',
          name: 'lastName',
          message: 'enter last name'
        }
      ])
      .then(answer => {
        const params = [answer.firstName, answer.lastName]
        // roles from roles table
        const roleSql = `SELECT role.id, role.title FROM role`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err

          const roles = data.map(({ id, title }) => ({ name: title, value: id }))

          inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: 'enter employee role',
              choices: roles
            }
          ])
          .then(roleChoice => {
            const role = roleChoice.role
            params.push(role)

            const managerSql = `SELECT * FROM employee`

            connection.query(managerSql, (err, data) => {
              if (err) throw err

              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + ''+ last_name, value:id}))

              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: 'enter employee manager',
                  choices: managers
                }
              ])

              .then(managerChoice => {
                const manager = managerChoice.manager
                params.push(manager)

                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?);`

                connection.query(sql, params, (err, response) => {
                  if (err) throw err
                  console.log('employee added')
                  addEmployee()
                  showEmployees()
                })
              })
            })
          })
        })
      })
    }
  

  // update employee

  updateEmployee = () => {
    // get employees list from employee table
    const employeeSql = `SELECT * FROM employee`
    
    connection.query(employeeSql, (err, data) => {
      if (err) throw err
    
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + ''+ last_name, value: id }))

      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: 'select employee to update',
          choices: employees
        }
      ])

      .then(empChoice => {
        const employee = empChoice.name
        const params = []
        params.push(employee)

        const roleSql = `SELECT * FROM role`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err

          const roles = data.map(({ id, title }) => ({ name: title, value: id }))

            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: 'enter employee new role',
                choices: roles
              }
            ])

            .then(roleChoice => {
              const role = roleChoice.role
              params.push(role)

              let employee = params[0]
              params[0] = role
              params[1] = employee

              console.log(params)

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`

              connection.query(sql, params, (err, response) => {
                if (err) throw err
              console.log('employee updated')

              showEmployees()
              })
            })
        })
      })
    })
  }
  promptUser()
