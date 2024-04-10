
// Module dependencies
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path'
import errorHandler from 'errorhandler'
import favicon from 'serve-favicon'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config()

// alternative to __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// utils
import LOG from './utils/logger.js'

// create express app
const app = express();

// configure app.settings.............................
app.set('host', process.env.HOST || 'localhost')

// set the root view folder
app.set('views', path.join(__dirname, 'views'))

// this needs to be here for some reason

// specify original view engine (EJS)
app.set('view engine', 'ejs');
app.set('layout', 'layout.ejs')
app.use(expressLayouts)

// parse before routing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// configure middleware.....................................................
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')))

// log every call and pass it on for handling
app.use((req, res, next) => {
  LOG.debug(`${req.method} ${req.url}`)
  next()
})

import routes from'./routes/index.js';
app.use('/', routes)    // load routing to handle all requests
LOG.info('Loaded routing.')

app.use((req, res) => { res.status(404).render('error.ejs', {status: 404, message: 'NOT FOUND', layout: 'layout.ejs'}) }) // handle page not found errors

// specify various resources and apply them to our application
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))
app.use(errorHandler())

// call app.listen to start server
const host = app.get('host')
const port = 3000
app.listen(port, () => {
    console.log(`\nApp running at http://${host}:${port}`)
})

export default app;