const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./snapora.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Add the is_video column to the images table if it doesn't exist
db.serialize(() => {
  // First check if the column exists
  db.all("PRAGMA table_info(images)", (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
      db.close();
      return;
    }
    
    // Check if is_video column exists
    const hasIsVideoColumn = rows.some(row => row.name === 'is_video');
    const hasSharesColumn = rows.some(row => row.name === 'shares');
    
    if (!hasIsVideoColumn) {
      console.log('Adding is_video column to images table...');
      db.run("ALTER TABLE images ADD COLUMN is_video BOOLEAN DEFAULT 0", (err) => {
        if (err) {
          console.error('Error adding is_video column:', err.message);
        } else {
          console.log('Successfully added is_video column.');
        }
      });
    } else {
      console.log('is_video column already exists.');
    }
    
    if (!hasSharesColumn) {
      console.log('Adding shares column to images table...');
      db.run("ALTER TABLE images ADD COLUMN shares INTEGER DEFAULT 0", (err) => {
        if (err) {
          console.error('Error adding shares column:', err.message);
        } else {
          console.log('Successfully added shares column.');
        }
      });
    } else {
      console.log('shares column already exists.');
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