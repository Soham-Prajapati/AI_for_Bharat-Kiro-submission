// Minimal test to check if the function works
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

module.exports = app;
