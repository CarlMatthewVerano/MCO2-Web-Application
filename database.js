import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
dotenv.config()

const app = express();

app.use(express.static('src'));

const pool = mysql.createPool(
    {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        port: process.env.MYSQL_PORT,
        // password: process.env.MYSQL_PASSWORD
    }
).promise()

// HOW TO CHANGE PORTS DYNAMICALLY
// function refreshPool() {
//     pool = mysql.createPool({
//       host: process.env.MYSQL_HOST,
//       user: process.env.MYSQL_USER,
//       database: process.env.MYSQL_DATABASE,
//       port: process.env.MYSQL_PORT
//     });
//   }
// Call refreshPool() whenever you need to change the port, especially after the first cluster fails.


//CREATE (working)
export async function creator(name, value1) {
    const [rows] = await pool.query(`
    INSERT INTO test_table (name, value)
    VALUES ("${name}", "${value1}")
    `)
    return rows
}

//READ (working)
export async function read() {
    // returns an array of objects
    const [rows] = await pool.query("SELECT * FROM test_table")
    return rows
}

//UPDATE (working)
export async function updater(param, value1) {
    // returns an array of objects
    const [rows] = await pool.query(`
    UPDATE test_table
    SET value = "${value1}"
    WHERE name = "${param}"
    `)
    return rows
}

//DELETE (working)
export async function deleter(param) {
    // returns an array of objects
    const [rows] = await pool.query(`
    DELETE FROM test_table WHERE name = "${param}"
    `)
    return rows
}