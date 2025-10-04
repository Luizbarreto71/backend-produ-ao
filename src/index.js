const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const paymentRoutes = require('../routes/paymentRoutes');
const userRoutes = require('../routes/userRoutes');

connectDB();

const app = express();

app.use(
  cors({
    origin: ['https://mindkidss.com', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
