import express from 'express';
import { read, updater } from './database.js';
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Default route
app.get('/', async (req, res) => {
    const data = await read();
    console.log(data);
    res.render("index.ejs", { data })
})

// Create route
app.get('/create', (req, res) => {
    res.render("create.ejs")
})

// // Edit route
// app.get('/edit', (req, res) => {
//     res.render("edit.ejs")
// })

// Single Edit route
app.get('/edit/:name', async (req, res) => {
    const name = req.params.name
    const data = await read();
    const singleData = data.find((item) => item.name == name)
    res.render("edit.ejs", {singleData})
})

app.post('/edit/:name', async (req, res) => {
    const name = req.body.name
    const value = req.body.value
    console.log(name, value)
    await updater(name, value)
    res.redirect('/')
})

app.use(express.static('public'))

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})