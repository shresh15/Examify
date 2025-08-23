import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World from the backend!');
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});