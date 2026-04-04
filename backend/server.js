require('dotenv').config();
const app  = require('./src/app');
const port = parseInt(process.env.PORT, 10) || 3000;

const server = app.listen(port, () => {
  console.log(`[NEXUS] Server running on port ${port} (${process.env.NODE_ENV || 'development'})`);
});

process.on('SIGTERM', () => {
  console.log('[NEXUS] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[NEXUS] HTTP server closed.');
    process.exit(0);
  });
});
