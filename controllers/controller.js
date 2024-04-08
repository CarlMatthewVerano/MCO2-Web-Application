import express from 'express';
const api = express.Router()
export default api;
import { creator, deleter, read, updater } from '../database/database.js';

/* -----=-------- 
     get routes
   -------------- */
// Manage top-level request first
api.get('/', async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const data = await read(searchTerm);
    res.render("index", { data, layout: 'layout.ejs' })
})

api.get('/index', async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const data = await read(searchTerm);
    res.render("index", { data, layout: 'layout.ejs' })
})

// Create route
api.get('/create', (req, res) => {
    res.render("appointment/create.ejs", { layout: 'layout.ejs' })
})

api.get('/edit/:px_id', async (req, res) => {
    const px_id = req.params.px_id
    const data = await read();
    const singleData = await data.find((item) => item.px_id == px_id)

    // console.log(singleData)

    if (req.query.error) {
        singleData.error = req.query.error;
    }

    res.render("appointment/edit.ejs", {singleData, layout: 'layout.ejs'})
})

/* ----------- */
/* post routes */
/* ----------- */

api.post('/create', async (req, res) => {
    const px_id = req.body.px_id
    const appt_status = req.body.appt_status
    await creator(px_id, appt_status)
    res.redirect('/')
})

api.post('/edit/:px_id/update', async (req, res) => {
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
    const version = req.body.version
    console.log("WAASADA", px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status)

    // handle the optimistic locking error
    try {
        await updater(px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status, version)
        res.redirect('/')
    } catch (err) {
        if (err.message === 'Conflict occurred. Please retry the operation.') {
            // Optimistic locking error occurred
            // Redirect the user back to the edit page with an error message
            res.redirect(`/edit/${px_id}?error=Another user has updated this record. Please review their changes and try again.`);
        } else {
            // Some other error occurred
            console.error(err);
            res.status(500).send('An error occurred while processing your request.');
        }
    }
})

api.post('/edit/:px_id/delete', async (req, res) => {
    const px_id = req.body.px_id
    console.log(px_id)
    await deleter(px_id)
    res.redirect('/')
})