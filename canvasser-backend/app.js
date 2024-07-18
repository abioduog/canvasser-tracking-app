const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();