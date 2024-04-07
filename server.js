
// Module dependencies
import express from 'express';

// create express app
const app = express();

// specify original view engine (EJS)
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

import routes from'./routes/index.js';
app.use('/', routes)

app.use(express.static('public'))

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})