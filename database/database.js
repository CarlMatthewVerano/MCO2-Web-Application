import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import LOG from '../utils/logger.js'
dotenv.config()

const app = express();

app.use(express.static('src'));

let ports = ['20198', '20199', '20200'];
let currentPortIndex = 0;

let pool = mysql.createPool(
    {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        port: ports[currentPortIndex],
    }
).promise()

function refreshPool() {
    currentPortIndex = (currentPortIndex + 1) % ports.length;
    console.log(currentPortIndex)
    pool = mysql.createPool(
        {
            host: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            user: process.env.MYSQL_USER,
            port: ports[currentPortIndex],
        }
    ).promise();
}

// function to manually change connection pool
export function changePool(port) {
    return new Promise((resolve, reject) => {
        // Check if the port is valid
        try {
            if (!ports.includes(port)) {
                throw new Error('Invalid port');
            }
        
            pool = mysql.createPool(
                {
                    host: process.env.MYSQL_HOST,
                    database: process.env.MYSQL_DATABASE,
                    user: process.env.MYSQL_USER,
                    port: port,
                }
            ).promise();

            // Test the connection
            pool.query('SELECT 1')
                .then(() => {
                    resolve()
                    // log change from prev port to new port
                    LOG.info('Changed pool from port ' + ports[currentPortIndex] + ' to port ' + port)
                    
                    currentPortIndex = ports.indexOf(port);
                })
                .catch(err => {
                    console.error('Error changing pool', err);
                    reject(err);
                });
        } catch (err) {
            console.error('Error changing pool', err);
            reject(err);
        }
    });
}

//CREATE (working)
export async function creator(appt_id, status) {
    try{
        const [rows] = await pool.query(`
        INSERT INTO appointments (appt_id, px_id, clinic_id, doctor_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status, version)
        VALUES ("${appt_id}", "px_id", "clinic_val", "doctor_val", "${status}", "time_val", "date_val", "start_val", "end_val", "type_val", "virtual_val", 0)
        `)
        return rows
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return creator(appt_id, status);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//READ (working)
export async function read(searchTerm, limit = 20, page = 1) {
    try{
        let sql = "SELECT * FROM appointments";
        let countSql = "SELECT COUNT(*) as total FROM appointments";
        let params = [];
        let countParams = [];

        if (searchTerm) {
            sql += " WHERE appt_id LIKE ?";
            countSql += " WHERE appt_id LIKE ?";
            params.push(`%${searchTerm}%`);
            countParams.push(`%${searchTerm}%`);
        }
        sql += " ORDER BY appt_id LIMIT ? OFFSET ?";

        const offset = (page - 1) * limit;
        params.push(limit, offset)

        // returns an array of objects
        const [rows] = await pool.query(sql, params);
        const [countRows] = await pool.query(countSql, countParams);
        const total = countRows[0].total;

        return { rows, total };
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return read(searchTerm, limit, page);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//UPDATE (working)
export async function updater(appt_id, px_id, clinic_id, doctor_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status, version) {
    try{
        // Check if the record exists
        const [existingRows] = await pool.query(`
        SELECT * FROM appointments WHERE appt_id = "${appt_id}" AND version = ${version}
        `);

        // If the record doesn't exist, return an error or a message
        if (existingRows.length === 0) {
            return { message: 'Record not found', status: 404}
        }

        // If the record exists, update it
        const [rows] = await pool.query(`
        UPDATE appointments
        SET clinic_id = "${clinic_id}", doctor_id = "${doctor_id}", appt_status = "${appt_status}", time_queued = "${time_queued}", queue_date = "${queue_date}", start_time = "${start_time}", end_time = "${end_time}", appt_type = "${appt_type}", virtual_status = "${virtual_status}", version = version + 1
        WHERE appt_id = "${appt_id}" AND version = ${version}
        `);

        if (rows.affectedRows === 0) {
            throw new Error('Conflict occurred. Please retry the operation.');
        }

        return {message: 'Record updated', status: 200}
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return updater(appt_id, px_id, clinic_id, doctor_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status, version);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//DELETE (working)
export async function deleter(appt_id) {
    try{
        // Check if the record exists
        const [existingRows] = await pool.query(`
        SELECT * FROM appointments WHERE appt_id = "${appt_id}"
        `);

        // If the record doesn't exist, return an error or a message
        if (existingRows.length === 0) {
            return { message: 'Record not found', status: 404};
        }

        // If the record exists, delete it
        await pool.query(`
        DELETE FROM appointments WHERE appt_id = "${appt_id}"
        `);

        return {message: 'Record deleted', status: 200}
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return deleter(appt_id);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}