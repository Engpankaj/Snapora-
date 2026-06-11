const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./snapora.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Check the schema of the images table
db.serialize(() => {
  db.all("PRAGMA table_info(images)", (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
    } else {
      console.log('Images table schema:');
      console.log(rows);
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});