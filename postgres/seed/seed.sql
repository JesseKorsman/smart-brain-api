BEGIN TRANSACTION;

INSERT into  users (name, email, entries, joined) values ('Amber', 'amber@gmail.com', 4, '2018-01-23');
INSERT into login (hash, email) values ('$2a$10$WAK21U0LWl7C//jJ.DOB2uPP1DJQh7KUDgasdyQeGzkop2Pzl8W7u', 'amber@gmail.com');

INSERT into  users (name, email, entries, joined) values ('Jesse', 'jesse@gmail.com', 5, '2018-01-23');
INSERT into login (hash, email) values ('$2a$10$WAK21U0LWl7C//jJ.DOB2uPP1DJQh7KUDgasdyQeGzkop2Pzl8W7u', 'jesse@gmail.com');

COMMIT;