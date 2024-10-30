// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { exec } = require('child_process');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Smartwatch_Data',
    password: 'Vishal13',
    port: 5432,
});

// Endpoint to get the last heart rate
app.get('/api/last-heartrate', async (req, res) => {
    try {
        const result = await pool.query('SELECT heart_rate, timestamp FROM heart_rate_data ORDER BY timestamp DESC LIMIT 1');
        res.json(result.rows[0]); // Send only the last heart rate record
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



// Endpoint to get step count data
app.get('/api/steps', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM step_data ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Endpoint to start heart rate and step count monitor
app.post('/api/start-monitor', (req, res) => {
    console.log('Starting heart rate and step count monitor...');
    exec('python3 test.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            console.error(`stderr: ${stderr}`); // Log stderr for more context
            return res.status(500).send('Error starting the monitor.');
        }
        console.log(`stdout: ${stdout}`);
        res.send('Heart rate and step count monitor started.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
