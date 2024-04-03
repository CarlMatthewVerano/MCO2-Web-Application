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
export async function creator(name, value1) {
    try{
        const [rows] = await pool.query(`
        INSERT INTO test_table (name, value)
        VALUES ("${name}", "${value1}")
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
        let sql = "SELECT * FROM test_table";
        let params = [];

        if (searchTerm) {
            sql += " WHERE name LIKE ?";
            params.push(searchTerm);
        }
        sql += " ORDER BY name";
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
export async function updater(param, value1) {
    try{
        // returns an array of objects
        const [rows] = await pool.query(`
        UPDATE test_table
        SET value = "${value1}"
        WHERE name = "${param}"
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
export async function deleter(param) {
    try{
        // returns an array of objects
        const [rows] = await pool.query(`
        DELETE FROM test_table WHERE name = "${param}"
        `)
        return rows
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === 'ETIMEDOUT') {
            console.log("Retrying query")
            refreshPool();
            // Retry the function
            return deleter(param);
        } else {
            // Handle other errors as necessary
            throw err;
        }
    }
}