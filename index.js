const express = require(`express`);
const cors = require(`cors`)

const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors())
app.use(express.json());






//testing purpose
app.get('/', (req, res) => {
    res.send(`Gineous car service running`)
})

app.listen(port, () => {
    console.log(`the port is running ${port}`);
})