import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import userRoute from './routes/userRoute.js';
dotenv.config();


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
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(mongoUrl).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Routes
app.use('/api/v1/user', userRoute);

// listen to the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
