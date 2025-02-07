/**
 * Preview Server for Static Files in `/docs`
 * 
 * This script creates a simple Express server to serve static files from the `/docs` directory, which
 * is a collection of examples. Some examples may require a server to run properly, such as those that
 * use AJAX or WebSockets or those that require a server-side component. 
 * 
 * To run this server, simply run `node preview.js` from the command line. 
 * 
 * Modify the `PORT` constant to change the port number.
 */

// Import Express
import express from 'express';

// Import Path Utility
import path from 'path';

// Import URL Module for ES Module Compatibility
import { fileURLToPath } from 'url';

// Set Port
const PORT = 3080;

// Get Directory Name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express App
const app = express();

// Serve Static Files from `/docs`
app.use(express.static(path.join(__dirname, 'docs')));

// Serve Static Files from `/dist`
app.use(express.static(path.join(__dirname, 'dist')));

// Serve Static Files from `/src`
app.use(express.static(path.join(__dirname, 'src')));

// Redirect Root to `index.html`
app.get('/', (req, res) => {

    // Serve Main Page
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));

});

// Start Server
app.listen(PORT, () => {

    // Log Server URL
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
});