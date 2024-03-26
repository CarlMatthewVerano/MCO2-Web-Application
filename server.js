import dotenv from 'dotenv'
import mysql from 'mysql2'
dotenv.config()

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

export async function getNames() {
    // returns an array of objects
    const [rows] = await pool.query("SELECT * FROM test_table")
    return rows
}

// export async function getName(name) {
//     // returns an array of objects
//     const [rows] = await pool.query(`
//     SELECT *
//     FROM test_table
//     WHERE name = "${name}"
//     `)
//     return rows
// }

const tests = await getNames()
// gets a single row from the table
console.log(tests)

//CREATE
/*
INSERT INTO tablename (column1, and so on)
VALUES (value1, and so on);
export async function insertourmom(param){
    const [mother'sday] = await pool.query(`
    INSERT INTO tablename (column1, and so on)
    VALUES (param.value1, and so on)
    `)
}
*/

//READ
/*
SELECT
FROM
(whatever, sir oli)``````
export async function readurmom(param){ ur mum
    const [mother'sday] = await pool.query(`
    SELECT  field
    FROM    table
    WHERE   condition = "${param}"
    `)

    return mother'sday
}
*/

//UPDATE
/*
export async function updater(param) {
    // returns an array of objects
    const [rows] = await pool.query(`
    UPDATE test_table
    SET column1 = value1, column2 = value2, ...
    WHERE param = "${param}";
    `)
    return rows
}
 */

//DELETE
/*
export async function deleter(param) {
    // returns an array of objects
    const [rows] = await pool.query(`
    DELETE FROM test_table WHERE param = "${param}";
    `)
    return rows
}
 */