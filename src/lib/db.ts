import mysql from 'mysql2/promise';

export async function connectDB() {
  return await mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'time4swim'
  });
}