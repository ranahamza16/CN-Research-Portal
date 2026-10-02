/**
 * Database Initialization Script
 * Automatically provisions the database and table if not already present.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'research_portal';

  console.log('Connecting to MySQL server...');
  let connection;

  try {
    // Connect without database first to ensure it can be created
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log(`Connected to MySQL server at ${dbHost}:${dbPort}`);

    // Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✓ Database '${dbName}' verified/created.`);

    // Use Database
    await connection.query(`USE \`${dbName}\`;`);

    // Create Opportunities Table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS opportunities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        research_area VARCHAR(255) NOT NULL,
        faculty_name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        required_skills TEXT NOT NULL,
        available_positions INT NOT NULL,
        application_deadline DATE NOT NULL,
        status ENUM('Open', 'Closed') DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await connection.query(createTableQuery);
    console.log(`✓ Table 'opportunities' verified/created.`);

    // Check count of opportunities
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM opportunities');
    console.log(`Current records in opportunities: ${rows[0].count}`);

    console.log('\n Database initialization completed successfully!');
  } catch (error) {
    console.error(' Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
