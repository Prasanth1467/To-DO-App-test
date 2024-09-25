const db = require('../db/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Create a new user
const createUser = (name, email, password, callback) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  db.run(
    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
    [userId, name, email, hashedPassword],
    function (err) {
      if (err) {
        return callback(err); // Return the error to the callback
      }
      callback(null, { id: userId, name, email }); // Return the created user info
    }
  );
};

// Find user by email
const findUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return callback(err); // Handle the error
    }
    callback(null, user);
  });
};

// Update user profile
const updateUserProfile = (userId, name, email, password, callback) => {
  let updatePasswordQuery = password ? `, password = ?` : '';
  let params = [name, email];
  
  if (password) {
    params.push(bcrypt.hashSync(password, 10));
  }
  
  params.push(userId); // Add userId to the end of the parameters array

  db.run(
    `UPDATE users SET name = ?, email = ?${updatePasswordQuery} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        return callback(err); // Handle the error
      }
      callback(null, { id: userId, name, email }); // Return the updated user info
    }
  );
};

// Get user profile
const getUserProfile = (userId, callback) => {
  db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return callback(err); // Handle the error
    }
    callback(null, user);
  });
};

module.exports = { createUser, findUserByEmail, updateUserProfile, getUserProfile };
