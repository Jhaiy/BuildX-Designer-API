import express from 'express';
import emailRoutes from './routes/email.routes';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(express.json());

app.use ('/api', emailRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
