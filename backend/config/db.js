const mysql = require('mysql2/promise');
require('dotenv').config();

// Automatically enable SSL for remote cloud hosts (e.g. Railway, Aiven, Render)
const isRemoteHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

// Create connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : (process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || 'research_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Format dates as YYYY-MM-DD strings for clean JSON serialization
  ssl: isRemoteHost ? { rejectUnauthorized: false } : undefined
});

// Helper function to test database connectivity
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database:', process.env.DB_NAME || 'research_portal');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
