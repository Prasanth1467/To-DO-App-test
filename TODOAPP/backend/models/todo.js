const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const createTodo = (userId, title, status, callback) => {
  const todoId = uuidv4();
  db.run('INSERT INTO todos (id, userId, title, status) VALUES (?, ?, ?, ?)', [todoId, userId, title, status], callback);
};

const getTodosByUserId = (userId, callback) => {
  db.all('SELECT * FROM todos WHERE userId = ?', [userId], callback);
};

const updateTodoStatus = (todoId, status, callback) => {
  db.run('UPDATE todos SET status = ? WHERE id = ?', [status, todoId], callback);
};

const deleteTodo = (todoId, callback) => {
  db.run('DELETE FROM todos WHERE id = ?', [todoId], callback);
};

module.exports = { createTodo, getTodosByUserId, updateTodoStatus, deleteTodo };
