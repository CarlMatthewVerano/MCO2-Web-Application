import express from 'express';
const app = express();

app.set('view engine', 'ejs');

// Default route
app.get('/', (req, res) => {
    res.render("index.ejs")
})

app.get('/create', (req, res) => {
    res.render("create.ejs")
})

app.get('/edit', (req, res) => {
    res.render("edit.ejs")
})

app.use(express.static('public'))

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})