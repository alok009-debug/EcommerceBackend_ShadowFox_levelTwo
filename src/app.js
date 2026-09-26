const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const authRoute = require('./routes/authRoutes');
const products = require('./routes/productRoutes');
const cart = require('./routes/cartRoutes');
const orders = require('./routes/orderRoutes');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/auth', authRoute);

app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

app.use((req, res) => res.status(404).json({
    success: false,
    message: 'Route not found'
}));
app.use(errorHandler);

module.exports = app;