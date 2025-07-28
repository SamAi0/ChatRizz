import express from 'express';
import cors from 'cors';
import translateRoute from './translate.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/translate', translateRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 