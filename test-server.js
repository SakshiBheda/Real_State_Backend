const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./server');

let mongod;
let server;

const startTestServer = async () => {
  try {
    // Start in-memory MongoDB
    console.log('Starting in-memory MongoDB...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Override the MongoDB URI
    process.env.MONGODB_URI = uri;
    
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB');
    
    // Seed the database
    const { seedDatabase } = require('./utils/seedData');
    await seedDatabase();
    
    // Start the Express server
    const PORT = process.env.PORT || 12000;
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log('Test server is ready!');
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('API Documentation: Check the endpoints in your documentation');
      console.log('\nAdmin credentials:');
      console.log('Email: admin@realestate.com');
      console.log('Password: admin123');
    });
    
  } catch (error) {
    console.error('Error starting test server:', error);
    process.exit(1);
  }
};

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('\nShutting down test server...');
  if (server) {
    server.close();
  }
  if (mongod) {
    await mongod.stop();
  }
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server only if this file is run directly
if (require.main === module) {
  startTestServer();
}

module.exports = { startTestServer };