import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
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

//CREATE (working)
export async function creator(px_id, status) {
    try{
        const [rows] = await pool.query(`
        INSERT INTO appointments (px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status)
        VALUES ("${px_id}", "clinic_val", "doctor_val", "appt_val", "${status}", "time_val", "date_val", "start_val", "end_val", "type_val", "virtual_val")
        `)
        return rows
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return creator(name, value1);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//READ (working)
export async function read(searchTerm) {
    try{
        let sql = "SELECT * FROM appointments";
        let params = [];

        if (searchTerm) {
            sql += " WHERE px_id LIKE ?";
            params.push(searchTerm);
        }
        sql += " ORDER BY px_id";
        // returns an array of objects
        const [rows] = await pool.query(sql, params)
        return rows;
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return read(searchTerm);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//UPDATE (working)
export async function updater(px_id, clinic_id, doctor_id, appt_id, appt_status, time_queued, queue_date, start_time, end_time, appt_type, virtual_status) {
    try{
        // returns an array of objects
        const [rows] = await pool.query(`
        UPDATE appointments
        SET clinic_id = "${clinic_id}", doctor_id = "${doctor_id}", appt_id = "${appt_id}", appt_status = "${appt_status}", time_queued = "${time_queued}", queue_date = "${queue_date}", start_time = "${start_time}", end_time = "${end_time}", appt_type = "${appt_type}", virtual_status = "${virtual_status}"
        WHERE px_id = "${px_id}"
        `)
        return rows
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return updater(param, value1);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}

//DELETE (working)
export async function deleter(px_id) {
    try{
        // returns an array of objects
        const [rows] = await pool.query(`
        DELETE FROM appointments WHERE px_id = "${px_id}"
        `)
        return rows
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return deleter(px_id);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}