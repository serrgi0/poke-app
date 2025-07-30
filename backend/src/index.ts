import express from 'express';
import cors from 'cors';
import cardsRouter from './routes/card';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/cards', cardsRouter);

app.listen(PORT, () => {
    console.log(`Servidor Backend escuchando en http://localhost:${PORT}`);
});