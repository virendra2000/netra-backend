const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require('cors');
require('dotenv').config();
const connection = require('./db')
connection();
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'jwtoken');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    next();
  });
app.use(cookieParser());
app.use(require('./routes/auth.js'));
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is Running on ${port} port`);
})