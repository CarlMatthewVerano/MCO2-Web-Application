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
// async function executeQuery(query) {
//     try {
//       const [rows, fields] = await pool.query(query);
//       return rows;
//     } catch (err) {
//       console.error('Error executing query', err);
//       if (err.code === 'ETIMEDOUT') {
//         if (firstFailure) {
//           process.env.MYSQL_PORT = '20199';
//           firstFailure = false;
//         }
//         refreshPool();
//         // Retry the query
//         return executeQuery(query);
//       } else {
//         // Handle other errors as necessary
//         throw err;
//       }
//     }
//   }


//CREATE (working)
export async function creator(name, value1) {
    const [rows] = await pool.query(`
    INSERT INTO test_table (name, value)
    VALUES ("${name}", "${value1}")
    `)
    return rows
}

//READ (working)
export async function read(searchTerm) {
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