import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import helmet from 'helmet';
import AuthRoute from './routes/auth.routes.js'

dotenv.config();

const app = express()
const PORT = process.env.PORT 

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthRoute);

app.get('/', (req, res) => {
    res.send('MedRemind API is officially running in TypeScript!')
})

app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`);
})