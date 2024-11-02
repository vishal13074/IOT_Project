import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
    const [lastHeartRate, setLastHeartRate] = useState(null); // State for last heart rate
    const [steps, setSteps] = useState([]); // State for step count data
    const [heartRateMessage, setHeartRateMessage] = useState(""); // State for heart rate message

    const fetchLastHeartRate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/last-heartrate');
            const data = response.data;
            setLastHeartRate(data);

            // Check the latest heart rate and set message
            const latestHeartRate = data?.heart_rate;
            if (latestHeartRate >= 60 && latestHeartRate <= 100) {
                setHeartRateMessage("You're Good!...");
            } else {
                setHeartRateMessage("Your heart rate is outside the normal range. Consider consulting a doctor...");
            }
        } catch (error) {
            console.error('Error fetching last heart rate:', error);
        }
    };

    const fetchSteps = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/steps');
            setSteps(response.data);
        } catch (error) {
            console.error('Error fetching step data:', error);
        }
    };

    const startMonitoring = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/start-monitor');
            console.log(response.data);
        } catch (error) {
            console.error('Error starting monitoring:', error);
        }
    };

    useEffect(() => {
        fetchLastHeartRate();
        fetchSteps();
        const interval = setInterval(() => {
            fetchLastHeartRate();
            fetchSteps();
        }, 3000); // Update every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app">
            <h1>Smart Watch Monitor</h1>
            <button onClick={startMonitoring}>Start Monitoring</button>

            <h2>Heart Rate ❤️</h2>
            {/* Display message based on heart rate */}
            <p>{heartRateMessage}</p>
            <table>
                <thead>
                    <tr>
                        <th>Heart Rate (bpm)</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {lastHeartRate ? (
                        <tr>
                            <td>{lastHeartRate.heart_rate}</td>
                            <td>{new Date(lastHeartRate.timestamp).toLocaleString()}</td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="2">No heart rate data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <h2>Step Count 🚶‍♂️‍➡️</h2>
            <table>
                <thead>
                    <tr>
                        <th>Step Count</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {steps.map((step) => (
                        <tr key={step.timestamp}>
                            <td>{step.steps}</td>
                            <td>{new Date(step.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;
