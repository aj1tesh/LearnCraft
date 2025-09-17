require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { syncDatabase } = require('./models');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const progressRoutes = require('./routes/progress');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = ['https://learncraft-frontend.onrender.com'];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    corsOrigins: process.env.NODE_ENV === 'production' ? ['https://learncraft-frontend.onrender.com'] : 'all'
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'production') {
  const possiblePaths = [
    path.join(__dirname, '../client/build'),
    path.join(__dirname, '../../client/build'),
    path.join(process.cwd(), 'client/build'),
    path.join(process.cwd(), 'build')
  ];
  
  let buildPath = null;
  for (const testPath of possiblePaths) {
    if (require('fs').existsSync(testPath)) {
      buildPath = testPath;
      break;
    }
  }
  
  if (buildPath) {
    console.log('Serving static files from:', buildPath);
    console.log('Build directory exists:', true);
    app.use(express.static(buildPath));
  } else {
    console.error('Build directory not found in any of these locations:');
    possiblePaths.forEach(p => console.error('  -', p));
  }
}

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const possibleIndexPaths = [
      path.join(__dirname, '../client/build', 'index.html'),
      path.join(__dirname, '../../client/build', 'index.html'),
      path.join(process.cwd(), 'client/build', 'index.html'),
      path.join(process.cwd(), 'build', 'index.html')
    ];
    
    let indexPath = null;
    for (const testPath of possibleIndexPaths) {
      if (require('fs').existsSync(testPath)) {
        indexPath = testPath;
        break;
      }
    }
    
    if (indexPath) {
      console.log('Serving index.html from:', indexPath);
      console.log('Index file exists:', true);
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found in any of these locations:');
      possibleIndexPaths.forEach(p => console.error('  -', p));
      res.status(404).send('Frontend build not found');
    }
  });
}

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(error.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

const startServer = async () => {
  try {
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Production mode: ${process.env.NODE_ENV === 'production'}`);
      console.log(`📁 Current directory: ${__dirname}`);
      console.log(`📁 Process working directory: ${process.cwd()}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('📂 Directory contents:');
        try {
          const fs = require('fs');
          const dirs = ['..', '../..', process.cwd()];
          dirs.forEach(dir => {
            try {
              const contents = fs.readdirSync(dir);
              console.log(`  ${dir}:`, contents);
            } catch (e) {
              console.log(`  ${dir}: (cannot read)`);
            }
          });
        } catch (e) {
          console.log('  Error listing directories:', e.message);
        }
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
