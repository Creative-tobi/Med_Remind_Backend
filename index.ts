import express, {Application, Request, Response} from 'express';
import apiRoutes from "./routes/service.routes.js"
import dotenv from 'dotenv';
import cors from "cors";
import helmet from 'helmet';

dotenv.config();

const app = express()
const PORT = process.env.PORT 

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('MedRemind API is officially running in TypeScript!')
})

app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`);
})