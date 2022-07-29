USE employee_db

INSERT INTO department (name)
VALUES 
('Hematology'),
('Chemistry'),
('Microbiology'),
('Specials');

INSERT INTO role (title, salary, department_id)
VALUES
('Supervisor', 100000, 1),
('Lead', 80000, 1),
('Customer Service', 75000, 2), 
('Pathologist', 180000, 2),
('Secretary', 70000, 3), 
('Specimen processor', 65000, 3),
('Phlebotomist', 50000, 1),
('cytologist', 90000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Kim', 'Steven', 2, null),
('Rud', 'Mary', 1, 1),
('Mitchelle', 'Mark', 4, null),
('Clara', 'Peter', 3, 3),
('Abdi', 'Sayed', 4, null),
('Leonard', 'Jason', 5, 5),
('Janice', 'Mathew', 7, null),
('Lori', 'Black', 8, 7);