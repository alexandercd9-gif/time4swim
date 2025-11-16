import mysql from 'mysql2/promise';

export async function connectDB() {
  // Parse DATABASE_URL from .env
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:root@localhost:8889/time4swim';
  
  // Parse URL: mysql://user:password@host:port/database
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }
  
  const [, user, password, host, port, database] = match;
  
  return await mysql.createConnection({
    host,
    port: parseInt(port, 10),
    user,
    password,
    database
  });
}