import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import userRoute from './routes/userRoute.js';
import medicineRoute from './routes/medicineRoute.js';
import transactionRoute from './routes/transactionRoute.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = process.env.PORT || 8001;
const mongoUrl = process.env.MONGO_URL;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(mongoUrl).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/medicine', medicineRoute);
app.use('/api/v1/transaction', transactionRoute);

// listen to the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(errorMiddleware);