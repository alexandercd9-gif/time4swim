import mysql from 'mysql2/promise';

// Configuración para MAMP MySQL en puerto 8889
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'time4swim',
  port: 8889,
};

export async function connectDB() {
  return mysql.createConnection(dbConfig);
}
