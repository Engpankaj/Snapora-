const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'snapora_secret_key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Database setup
const db = new sqlite3.Database('./snapora.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    gender TEXT,
    date_of_birth DATE,
    bio TEXT,
    tags TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    posts INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    tags TEXT,
    category TEXT,
    nsfw BOOLEAN DEFAULT 0,
    likes INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_video BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (image_id) REFERENCES images (id),
    UNIQUE(user_id, image_id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users (id),
    FOREIGN KEY (following_id) REFERENCES users (id),
    UNIQUE(follower_id, following_id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (image_id) REFERENCES images (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (image_id) REFERENCES images (id),
    UNIQUE(user_id, image_id)
  )`);
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file extension as well as MIME type for better detection
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image/') ||
        fileExtension === '.jpg' || fileExtension === '.jpeg' ||
        fileExtension === '.png' || fileExtension === '.gif' ||
        fileExtension === '.webp' || fileExtension === '.bmp') {
      cb(null, true);
    } else if (file.mimetype.startsWith('video/') ||
               fileExtension === '.mp4' || fileExtension === '.mov' ||
               fileExtension === '.avi') {
      // Check video format (basic check)
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (allowedVideoTypes.includes(file.mimetype) ||
          fileExtension === '.mp4' || fileExtension === '.mov' ||
          fileExtension === '.avi') {
        cb(null, true);
      } else {
        cb(new Error('Only MP4, MOV, and AVI video files are allowed!'));
      }
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register new user
app.post('/api/register', (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, username, email, password } = req.body;
    
    // Server-side validation
    if (!name || !username || !email || !password) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (name.length < 2) {
      console.log('Validation failed: name too short');
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    
    if (username.length < 3) {
      console.log('Validation failed: username too short');
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Validation failed: invalid email');
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    console.log('Checking if user already exists');
    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        console.log('User already exists');
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      
      console.log('Hashing password');
      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Password hashing error:', err);
          return res.status(500).json({ error: 'Error hashing password' });
        }
        
        console.log('Inserting user into database');
        // Insert new user with default stats
        db.run('INSERT INTO users (name, username, email, password, followers, following, posts) VALUES (?, ?, ?, ?, 0, 0, 0)',
          [name, username, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('User creation error:', err);
              return res.status(500).json({ error: 'Error creating user' });
            }
            
            console.log('User created successfully with ID:', this.lastID);
            // Generate JWT token
            const token = jwt.sign({ id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '7d' });
            
            res.status(201).json({
              message: 'User created successfully',
              token,
              user: { id: this.lastID, name, username, email }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Server-side validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      // Check password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Error checking password' });
        }
        
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, name: user.name, username: user.username, email: user.email }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, name, username, email, avatar, gender, date_of_birth, bio, tags, followers, following, posts, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  });
});

// Get user profile by ID
app.get('/api/user/:id/profile', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  db.get('SELECT id, name, username, email, avatar, gender, date_of_birth, bio, tags, followers, following, posts, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  });
});

// Update user profile
app.put('/api/profile', authenticateToken, upload.single('avatar'), (req, res) => {
  const user_id = req.user.id;
  const { name, gender, date_of_birth, bio, tags } = req.body;
  
  // Prepare update fields
  let updateFields = [];
  let updateValues = [];
  
  if (name) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  
  if (gender) {
    updateFields.push('gender = ?');
    updateValues.push(gender);
  }
  
  if (date_of_birth) {
    updateFields.push('date_of_birth = ?');
    updateValues.push(date_of_birth);
  }
  
  if (bio) {
    updateFields.push('bio = ?');
    updateValues.push(bio);
  }
  
  if (tags) {
    updateFields.push('tags = ?');
    updateValues.push(tags);
  }
  
  if (req.file) {
    console.log('Avatar file uploaded:', req.file);
    updateFields.push('avatar = ?');
    updateValues.push(req.file.filename);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updateValues.push(user_id);
  
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(query, updateValues, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating profile' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  });
});

// Delete user account
app.delete('/api/profile', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  
  // Delete user's images
  db.run('DELETE FROM images WHERE user_id = ?', [user_id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user images' });
    }
    
    // Delete user's likes
    db.run('DELETE FROM likes WHERE user_id = ?', [user_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting user likes' });
      }
      
      // Delete user's follows
      db.run('DELETE FROM follows WHERE follower_id = ? OR following_id = ?', [user_id, user_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error deleting user follows' });
        }
        
        // Delete the user
        db.run('DELETE FROM users WHERE id = ?', [user_id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error deleting user' });
          }
          
          res.json({ message: 'Account deleted successfully' });
        });
      });
    });
  });
});

// Upload image
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    try {
        console.log('Upload request received:', req.file, req.body);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { title, description, tags, category, nsfw } = req.body;
        const user_id = req.user.id;
        const filename = req.file.filename;
        const filepath = req.file.path;
        
        // Server-side validation
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        if (title.length < 3) {
            return res.status(400).json({ error: 'Title must be at least 3 characters long' });
        }
        
        if (description && description.length > 500) {
            return res.status(400).json({ error: 'Description must be less than 500 characters' });
        }
        
        const validCategories = [
            'nature', 'art', 'photography', 'design', 'other',
            'people-lifestyle', 'travel-places', 'food-drinks', 'animals-pets',
            'technology', 'events-celebrations', 'fashion-style',
            'fantasy-abstract', 'history-culture', 'vehicles', 'anime', 'cartoons'
        ];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        
        // Check if file is video
        const isVideo = req.file.mimetype.startsWith('video/') ||
                       path.extname(req.file.originalname).toLowerCase() === '.mp4' ||
                       path.extname(req.file.originalname).toLowerCase() === '.mov' ||
                       path.extname(req.file.originalname).toLowerCase() === '.avi';
        console.log('File is video:', isVideo, 'MIME type:', req.file.mimetype);
        
        db.run(
            'INSERT INTO images (user_id, title, description, filename, path, tags, category, nsfw, is_video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, filename, filepath, tags, category, nsfw === 'true' ? 1 : 0, isVideo ? 1 : 0],
            function(err) {
                if (err) {
                    console.error('Database error when saving media:', err);
                    return res.status(500).json({ error: 'Error saving media to database: ' + err.message });
                }
                
                // Update user's post count
                db.run('UPDATE users SET posts = posts + 1 WHERE id = ?', [user_id], (err) => {
                    if (err) {
                        console.error('Error updating user post count:', err);
                    }
                });
                
                res.status(201).json({
                    message: 'Media uploaded successfully',
                    image: {
                        id: this.lastID,
                        user_id,
                        title,
                        description,
                        filename,
                        path: filepath,
                        tags,
                        category,
                        nsfw: nsfw === 'true' ? 1 : 0,
                        is_video: isVideo ? 1 : 0
                    }
                });
            }
        );
    } catch (error) {
        console.error('Server error during upload:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get all images with filtering and sorting
app.get('/api/images', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const sort = req.query.sort || 'recent';
    
    // Build the query based on filters and sorting
    let query = `SELECT i.*, u.username, u.name as user_name
                 FROM images i
                 JOIN users u ON i.user_id = u.id`;
    
    // Add category filter if specified and not 'all'
    if (category && category !== 'all') {
        query += ` WHERE i.category = ?`;
    }
    
    // Add sorting
    switch (sort) {
        case 'popular':
            query += ` ORDER BY i.downloads DESC, i.likes DESC`;
            break;
        case 'liked':
            query += ` ORDER BY i.likes DESC`;
            break;
        case 'recent':
        default:
            query += ` ORDER BY i.created_at DESC`;
            break;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    
    // Build parameters array
    let params = [];
    if (category && category !== 'all') {
        params.push(category);
    }
    params.push(limit, offset);
    
    db.all(query, params, (err, images) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Build count query
        let countQuery = 'SELECT COUNT(*) as count FROM images i';
        let countParams = [];
        
        if (category && category !== 'all') {
            countQuery += ` WHERE i.category = ?`;
            countParams.push(category);
        }
        
        db.get(countQuery, countParams, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                images,
                pagination: {
                    page,
                    limit,
                    total: result.count,
                    pages: Math.ceil(result.count / limit)
                }
            });
        });
    });
});

// Like an image
app.post('/api/images/:id/like', authenticateToken, (req, res) => {
  const image_id = req.params.id;
  const user_id = req.user.id;
  
  // Check if user already liked this image
  db.get('SELECT id FROM likes WHERE user_id = ? AND image_id = ?', [user_id, image_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      // Unlike the image
      db.run('DELETE FROM likes WHERE user_id = ? AND image_id = ?', [user_id, image_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error removing like' });
        }
        
        // Update image likes count
        db.run('UPDATE images SET likes = likes - 1 WHERE id = ?', [image_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating likes count' });
          }
          
          res.json({ message: 'Image unliked successfully' });
        });
      });
    } else {
      // Add like
      db.run('INSERT INTO likes (user_id, image_id) VALUES (?, ?)', [user_id, image_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error adding like' });
        }
        
        // Update image likes count
        db.run('UPDATE images SET likes = likes + 1 WHERE id = ?', [image_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating likes count' });
          }
          
          res.json({ message: 'Image liked successfully' });
        });
      });
    }
  });
});

// Follow a user
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  const following_id = req.params.id;
  const follower_id = req.user.id;
  
  // Prevent users from following themselves
  if (follower_id == following_id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }
  
  // Check if user already follows this user
  db.get('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?', [follower_id, following_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      // Unfollow the user
      db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [follower_id, following_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error unfollowing user' });
        }
        
        // Update followers count for the followed user
        db.run('UPDATE users SET followers = followers - 1 WHERE id = ?', [following_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating followers count' });
          }
          
          // Update following count for the follower
          db.run('UPDATE users SET following = following - 1 WHERE id = ?', [follower_id], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating following count' });
            }
            
            res.json({ message: 'User unfollowed successfully' });
          });
        });
      });
    } else {
      // Follow the user
      db.run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [follower_id, following_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error following user' });
        }
        
        // Update followers count for the followed user
        db.run('UPDATE users SET followers = followers + 1 WHERE id = ?', [following_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating followers count' });
          }
          
          // Update following count for the follower
          db.run('UPDATE users SET following = following + 1 WHERE id = ?', [follower_id], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating following count' });
            }
            
            res.json({ message: 'User followed successfully' });
          });
        });
      });
    }
  });
});

// Get user follow status
app.get('/api/users/:id/follow-status', authenticateToken, (req, res) => {
  const user_id = req.params.id;
  const current_user_id = req.user.id;
  
  db.get('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?', [current_user_id, user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ is_following: !!row });
  });
});

// Add comment to image
app.post('/api/images/:id/comments', authenticateToken, (req, res) => {
  const image_id = req.params.id;
  const user_id = req.user.id;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  db.run('INSERT INTO comments (user_id, image_id, content) VALUES (?, ?, ?)',
    [user_id, image_id, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding comment' });
      }
      
      res.status(201).json({
        message: 'Comment added successfully',
        comment: {
          id: this.lastID,
          user_id,
          image_id,
          content,
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Get comments for an image
app.get('/api/images/:id/comments', (req, res) => {
  const image_id = req.params.id;
  
  db.all(
    `SELECT c.*, u.username, u.name as user_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.image_id = ?
     ORDER BY c.created_at DESC`,
    [image_id],
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ comments });
    }
  );
});

// Get user images
app.get('/api/user/:id/images', (req, res) => {
  const user_id = req.params.id;
  const page = parseInt(req.query.page) || 1;
  // Check if limit is 'all' to fetch all images
  const limitParam = req.query.limit;
  const limit = limitParam === 'all' ? null : (parseInt(limitParam) || 12);
  const offset = limit ? (page - 1) * limit : 0;
  
  // Build query based on whether we want all images or paginated
  let query, countQuery;
  let params = [];
  
  if (limit === null) {
    // Fetch all images
    query = `SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC`;
    params = [user_id];
    countQuery = 'SELECT COUNT(*) as count FROM images WHERE user_id = ?';
  } else {
    // Fetch paginated images
    query = `SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params = [user_id, limit, offset];
    countQuery = 'SELECT COUNT(*) as count FROM images WHERE user_id = ?';
  }
  
  db.all(query, params, (err, images) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get(countQuery, [user_id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        images,
        pagination: limit === null ? null : {
          page,
          limit,
          total: result.count,
          pages: Math.ceil(result.count / limit)
        }
      });
    });
  });
});


// Get user's liked images
app.get('/api/user/:id/liked-images', (req, res) => {
    const user_id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    // Check if limit is 'all' to fetch all images
    const limitParam = req.query.limit;
    const limit = limitParam === 'all' ? null : (parseInt(limitParam) || 12);
    const offset = limit ? (page - 1) * limit : 0;
    
    // Build query based on whether we want all images or paginated
    let query, countQuery;
    let params = [];
    
    if (limit === null) {
        // Fetch all liked images
        query = `
            SELECT i.*, u.username, u.name as user_name, l.created_at as liked_at
            FROM likes l
            JOIN images i ON l.image_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE l.user_id = ?
            ORDER BY l.created_at DESC
        `;
        params = [user_id];
        countQuery = 'SELECT COUNT(*) as count FROM likes WHERE user_id = ?';
    } else {
        // Fetch paginated liked images
        query = `
            SELECT i.*, u.username, u.name as user_name, l.created_at as liked_at
            FROM likes l
            JOIN images i ON l.image_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE l.user_id = ?
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params = [user_id, limit, offset];
        countQuery = 'SELECT COUNT(*) as count FROM likes WHERE user_id = ?';
    }
    
    db.all(query, params, (err, images) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get total count of liked images
        db.get(countQuery, [user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                images,
                pagination: limit === null ? null : {
                    page,
                    limit,
                    total: result.count,
                    pages: Math.ceil(result.count / limit)
                }
            });
        });
    });
});

// Increment image download count
app.post('/api/images/:id/download', (req, res) => {
    const image_id = req.params.id;
    
    // Update image download count
    db.run('UPDATE images SET downloads = downloads + 1 WHERE id = ?', [image_id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating download count' });
        }
        
        res.json({ message: 'Download count updated successfully' });
    });
});

// Increment image share count
app.post('/api/images/:id/share', (req, res) => {
    const image_id = req.params.id;
    
    // Update image share count
    db.run('UPDATE images SET shares = shares + 1 WHERE id = ?', [image_id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating share count' });
        }
        
        res.json({ message: 'Share count updated successfully' });
    });
});

// Add image to user's collection
app.post('/api/images/:id/collect', authenticateToken, (req, res) => {
    const image_id = req.params.id;
    const user_id = req.user.id;
    
    // Add image to user's collection
    db.run('INSERT OR IGNORE INTO collections (user_id, image_id) VALUES (?, ?)', [user_id, image_id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error adding image to collection' });
        }
        
        res.json({ message: 'Image added to collection successfully' });
    });
});

// Get user's collected images
app.get('/api/user/:id/collections', (req, res) => {
    const user_id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    // Check if limit is 'all' to fetch all images
    const limitParam = req.query.limit;
    const limit = limitParam === 'all' ? null : (parseInt(limitParam) || 12);
    const offset = limit ? (page - 1) * limit : 0;
    
    // Build query based on whether we want all images or paginated
    let query, countQuery;
    let params = [];
    
    if (limit === null) {
        // Fetch all collected images
        query = `
            SELECT i.*, u.username, u.name as user_name, c.created_at as collected_at
            FROM collections c
            JOIN images i ON c.image_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        params = [user_id];
        countQuery = 'SELECT COUNT(*) as count FROM collections WHERE user_id = ?';
    } else {
        // Fetch paginated collected images
        query = `
            SELECT i.*, u.username, u.name as user_name, c.created_at as collected_at
            FROM collections c
            JOIN images i ON c.image_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params = [user_id, limit, offset];
        countQuery = 'SELECT COUNT(*) as count FROM collections WHERE user_id = ?';
    }
    
    db.all(query, params, (err, images) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get total count of collected images
        db.get(countQuery, [user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                images,
                pagination: limit === null ? null : {
                    page,
                    limit,
                    total: result.count,
                    pages: Math.ceil(result.count / limit)
                }
            });
        });
    });
});

// Download image endpoint
app.get('/api/images/:id/download-file', (req, res) => {
    const image_id = req.params.id;
    
    console.log('Download request for image ID:', image_id);
    
    // Get image info from database
    db.get('SELECT path, filename FROM images WHERE id = ?', [image_id], (err, image) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!image) {
            console.log('Image not found in database for ID:', image_id);
            return res.status(404).json({ error: 'Image not found' });
        }
        
        console.log('Image found:', image);
        
        // Construct the file path
        const filePath = path.join(__dirname, image.path);
        
        console.log('Constructed file path:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log('File not found at path:', filePath);
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Extract the actual filename from the path
        const actualFilename = path.basename(image.filename);
        
        // Determine the content type based on file extension
        const ext = path.extname(actualFilename).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.bmp':
                contentType = 'image/bmp';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.mov':
                contentType = 'video/quicktime';
                break;
            case '.avi':
                contentType = 'video/x-msvideo';
                break;
        }
        
        // Check if it's a video file
        const isVideo = contentType.startsWith('video/');
        
        // Set headers for file download
        if (!isVideo) {
            // For images, set attachment header
            res.setHeader('Content-Disposition', `attachment; filename="${actualFilename}"`);
        }
        res.setHeader('Content-Type', contentType);
        
        // Send the file
        console.log('Sending file:', filePath);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                // Don't send another response if headers already sent
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Error sending file' });
                }
            }
        });
    });
});

// Get user's videos
app.get('/api/user/:id/videos', (req, res) => {
    const user_id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    // Check if limit is 'all' to fetch all videos
    const limitParam = req.query.limit;
    const limit = limitParam === 'all' ? null : (parseInt(limitParam) || 12);
    const offset = limit ? (page - 1) * limit : 0;
    
    // Build query based on whether we want all videos or paginated
    let query, countQuery;
    let params = [];
    
    if (limit === null) {
        // Fetch all videos
        query = `
            SELECT * FROM images
            WHERE user_id = ? AND is_video = 1
            ORDER BY created_at DESC
        `;
        params = [user_id];
        countQuery = 'SELECT COUNT(*) as count FROM images WHERE user_id = ? AND is_video = 1';
    } else {
        // Fetch paginated videos
        query = `
            SELECT * FROM images
            WHERE user_id = ? AND is_video = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        params = [user_id, limit, offset];
        countQuery = 'SELECT COUNT(*) as count FROM images WHERE user_id = ? AND is_video = 1';
    }
    
    db.all(query, params, (err, videos) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get total count of videos
        db.get(countQuery, [user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                videos,
                pagination: limit === null ? null : {
                    page,
                    limit,
                    total: result.count,
                    pages: Math.ceil(result.count / limit)
                }
            });
        });
    });
});

// Get user's followers
app.get('/api/user/:id/followers', (req, res) => {
    const user_id = req.params.id;
    
    // Query to get followers with their details
    const query = `
        SELECT u.id, u.name, u.username, u.avatar
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
        ORDER BY f.created_at DESC
    `;
    
    db.all(query, [user_id], (err, followers) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ followers });
    });
});

// Get user's following
app.get('/api/user/:id/following', (req, res) => {
    const user_id = req.params.id;
    
    // Query to get following users with their details
    const query = `
        SELECT u.id, u.name, u.username, u.avatar
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
    `;
    
    db.all(query, [user_id], (err, following) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ following });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;