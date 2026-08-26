import "dotenv/config";
import app from './app.js';
import connectdb from './config/database.js';

const PORT = process.env.PORT || 3000;

await connectdb();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => process.exit(0));
});
