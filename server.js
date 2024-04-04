import express from 'express';
import { creator, deleter, read, updater } from './database.js';
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Default route
app.get('/', async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const data = await read(searchTerm);
    res.render("index.ejs", { data })
})

// Create route
app.get('/create', (req, res) => {
    res.render("create.ejs")
})

app.post('/create', async (req, res) => {
    const px_id = req.body.px_id
    const appt_status = req.body.appt_status
    await creator(px_id, appt_status)
    res.redirect('/')
})

app.get('/edit/:px_id', async (req, res) => {
    const px_id = req.params.px_id
    const data = await read();
    const singleData = data.find((item) => item.px_id == px_id)
    res.render("edit.ejs", {singleData})
})

app.post('/edit/:px_id/update', async (req, res) => {
    const px_id = req.params.px_id
    const clinic_id = req.body.clinic_id
    const doctor_id = req.body.doctor_id
    const appt_id = req.body.appt_id
    const appt_status = req.body.appt_status
    const time_queued = req.body.time_queued
    const queue_date = req.body.queue_date
    const start_time = req.body.start_time
    const end_time = req.body.end_time
    const appt_type = req.body.appt_type
    const virtual_status = req.body.virtual_status
    console.log("WAASADA", px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status)
    await updater(px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status)
    res.redirect('/')
})

app.post('/edit/:px_id/delete', async (req, res) => {
    const px_id = req.body.px_id
    console.log(px_id)
    await deleter(px_id)
    res.redirect('/')
})

app.use(express.static('public'))

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})