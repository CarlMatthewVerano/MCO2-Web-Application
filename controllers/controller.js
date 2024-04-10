import express from 'express';
const api = express.Router()

// other imports
import { creator, deleter, read, readPagination, updater, changePool } from '../database/database.js';
import LOG from '../utils/logger.js'

/* -----=-------- 
get routes
-------------- */
// Manage top-level request first
api.get('/', async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const page = parseInt(req.query.page, 10) || 1; // default to page 1 if not provided
    const limit = parseInt(req.query.limit, 10) || 20; // default to 20 items per page if not provided

    const response = await readPagination(searchTerm, limit, page);

    const totalItems = response.total;
    const totalPages = Math.ceil(totalItems / limit);

    console.log('totalItems: ' + totalItems)
    console.log('totalPages: ' + totalPages)
    console.log('currentPage: ' + page)
    
    res.render("index", { data: response.rows, layout: 'layout.ejs', totalPages, currentPage: page, searchTerm})
})

// Create route
api.get('/create', (req, res) => {
    res.render("appointment/create.ejs", { layout: 'layout.ejs' })
})

api.get('/edit/:appt_id', async (req, res) => {
    const appt_id = req.params.appt_id

    const data = await read();
    const singleData = await data.find((item) => item.appt_id == appt_id)
    
    if (req.query.error) {
        singleData.error = req.query.error;
    }
    
    // console.log(singleData)
    if (singleData === undefined) {
        res.render('error.ejs', {status: 404, message: 'Record not found', layout: 'layout.ejs'});
    } else {
        // Handle successful update
        // For example, you might redirect to a success page
        res.render("appointment/edit.ejs", {singleData, layout: 'layout.ejs'})
    }
})

/* ----------- */
/* post routes */
/* ----------- */

api.post('/create', async (req, res) => {
    const appt_id = req.body.appt_id
    const appt_status = req.body.appt_status
    await creator(appt_id, appt_status)
    res.redirect('/')
})

api.post('/edit/:appt_id/update', async (req, res) => {
    
    // handle the optimistic locking error
    try {
        const appt_id = req.params.appt_id
        const clinic_id = req.body.clinic_id
        const doctor_id = req.body.doctor_id
        const px_id = req.body.px_id
        const appt_status = req.body.appt_status
        const time_queued = req.body.time_queued
        const queue_date = req.body.queue_date
        const start_time = req.body.start_time
        const end_time = req.body.end_time
        const appt_type = req.body.appt_type
        const virtual_status = req.body.virtual_status
        const version = req.body.version
        console.log("WAASADA", px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status)


        const response = await updater(appt_id, px_id, clinic_id, doctor_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status, version)
        
        if (response.status === 404) {
            res.render('error.ejs', {status: 404, message: 'Record not found', layout: 'layout.ejs'});
        } else {
            // Handle successful update
            // For example, you might redirect to a success page
            res.redirect('/');
        }
    } catch (err) {
        if (err.message === 'Conflict occurred. Please retry the operation.') {
            // Optimistic locking error occurred
            // Redirect the user back to the edit page with an error message
            res.redirect(`/edit/${appt_id}?error=Another user has updated this record. Please review their changes and try again.`);
        } else {
            // Some other error occurred
            console.error(err);
            res.status(500).send('An error occurred while processing your request.');
        }
    }
})

api.post('/edit/:appt_id/delete', async (req, res) => {
    const appt_id = req.params.appt_id
    console.log(appt_id)
    const response = await deleter(appt_id)
    
    if (response.status === 404) {
        res.render('error.ejs', {status: 404, message: 'Record not found', layout: 'layout.ejs'});
    } else {
        // Handle successful update
        // For example, you might redirect to a success page
        res.redirect('/');
    }
})

api.post('/changePool', async (req, res) => {
    const newPort = req.body.newPort; // Assuming the new port is sent in the request body

    console.log(newPort)
        
    try {
        await changePool(newPort)
        res.status(200).send('Pool changed successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while changing the pool.');
    }
});

export default api;