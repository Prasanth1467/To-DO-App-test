const express = require('express');
const { createTodo, getTodosByUserId, updateTodoStatus, deleteTodo } = require('../models/todo');
const router = express.Router();

// Create a new todo
router.post('/', (req, res) => {
  const { title, status } = req.body;
  const userId = req.userId;

  createTodo(userId, title, status, (err) => {
    if (err) return res.status(500).json({ message: 'Error creating todo' });
    res.status(201).json({ message: 'Todo created successfully' });
  });
});

// Get all todos for a user
router.get('/', (req, res) => {
  const userId = req.userId;

  getTodosByUserId(userId, (err, todos) => {
    if (err) return res.status(500).json({ message: 'Error fetching todos' });
    res.json(todos);
  });
});

// Update a todo's status
router.put('/:id', (req, res) => {
  const todoId = req.params.id;
  const { status } = req.body;

  updateTodoStatus(todoId, status, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating todo' });
    res.json({ message: 'Todo updated successfully' });
  });
});

// Delete a todo
router.delete('/:id', (req, res) => {
    const todoId = req.params.id;
  
    deleteTodo(todoId, (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting todo' });
      res.json({ message: 'Todo deleted successfully' });
    });
  });
  
  module.exports = router;
  
