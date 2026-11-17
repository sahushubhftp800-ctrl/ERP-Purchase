const fs = require('fs');
const path = require('path');
const db = require('./db');

async function autoMigrate() {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('🔄 First run detected: Initializing database schema & seeds...');
      
      const possibleSchemaPaths = [
        path.join(__dirname, '../../database/schema.sql'),
        path.join(__dirname, '../database/schema.sql'),
        path.join(process.cwd(), 'database/schema.sql')
      ];
      
      const possibleSeedPaths = [
        path.join(__dirname, '../../database/seed.sql'),
        path.join(__dirname, '../database/seed.sql'),
        path.join(process.cwd(), 'database/seed.sql')
      ];

      const schemaPath = possibleSchemaPaths.find(p => fs.existsSync(p));
      const seedPath = possibleSeedPaths.find(p => fs.existsSync(p));

      if (schemaPath) {
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Filter out CREATE DATABASE / USE to be safe with cloud DB naming
        schemaSql = schemaSql.replace(/CREATE DATABASE[^\n;]+;/gi, '').replace(/USE [^\n;]+;/gi, '');
        await db.query(schemaSql);
        console.log('✅ Database schema created successfully from:', schemaPath);
      }

      if (seedPath) {
        let seedSql = fs.readFileSync(seedPath, 'utf8');
        seedSql = seedSql.replace(/USE [^\n;]+;/gi, '');
        await db.query(seedSql);
        console.log('✅ Seed data inserted successfully from:', seedPath);
      }
    } else {
      console.log('✅ Database schema is up to date (tables found).');
    }
  } catch (err) {
    console.error('⚠️ Auto-migration check warning:', err.message);
  }
}

module.exports = autoMigrate;
