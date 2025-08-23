import express from "express"
const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World from the backend!');
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});