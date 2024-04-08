
// Module dependencies
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path'
import errorHandler from 'errorhandler'
import favicon from 'serve-favicon'

// alternative to __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create express app
const app = express();

// set the root view folder
app.set('views', path.join(__dirname, 'views'))

// configure middleware.....................................................
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')))

// specify original view engine (EJS)
app.set('view engine', 'ejs');
app.set('layout', 'layout.ejs')
app.use(expressLayouts)


import routes from'./routes/index.js';
app.use('/', routes)

// app.use((req, res) => { res.status(404).render('error.ejs', {status: 404, message: 'NOT FOUND', layout: 'layout.ejs'}) }) // handle page not found errors

// specify various resources and apply them to our application
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))
app.use(errorHandler())

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

export default app;