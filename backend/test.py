import asyncio
from bleak import BleakClient
import asyncpg
from datetime import datetime

DEVICE_ADDRESS = "AA:0A:9A:57:E4:59"  # Replace with your smartwatch's MAC address
HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb"
STEP_COUNT_CHARACTERISTIC = "0000fee1-0000-1000-8000-00805f9b34fb"  # Replace with your suspected step count characteristic

# Database connection details
DB_USER = 'postgres'
DB_PASSWORD = 'Vishal13'
DB_NAME = 'Smartwatch_Data'
DB_HOST = 'localhost'
DB_PORT = '5432'

# Variables to store the last heart rate and step count
last_heart_rate = [None]
last_step_count = [None]

# Function to save heart rate to the database
async def save_heart_rate_to_db(heart_rate):
    timestamp = datetime.now()
    conn = await asyncpg.connect(user=DB_USER, password=DB_PASSWORD, database=DB_NAME, host=DB_HOST, port=DB_PORT)
    async with conn.transaction():
        await conn.execute(
            'INSERT INTO heart_rate_data (heart_rate, timestamp) VALUES ($1, $2)',
            heart_rate, timestamp
        )
    await conn.close()

# Function to save step count to the database
async def save_steps_to_db(steps):
    timestamp = datetime.now()
    conn = await asyncpg.connect(user=DB_USER, password=DB_PASSWORD, database=DB_NAME, host=DB_HOST, port=DB_PORT)
    async with conn.transaction():
        await conn.execute(
            'INSERT INTO step_data (steps, timestamp) VALUES ($1, $2)',
            steps, timestamp
        )
    await conn.close()

async def start_monitoring():
    async with BleakClient(DEVICE_ADDRESS) as client:
        print(f"Connected to {DEVICE_ADDRESS}")

        # Heart rate handler
        async def handle_heart_rate(sender, data):
            heart_rate = data[1]  # Assuming heart rate is in the second byte
            print(f"Heart Rate: {heart_rate}")
            last_heart_rate[0] = heart_rate  # Update the last heart rate value
            await save_heart_rate_to_db(heart_rate)

        # Step count handler
        async def handle_steps(sender, data):
            step_count = int.from_bytes(data[:2], byteorder='little')  # Get step count from the first two bytes
            print(f"Step Count: {step_count}")
            last_step_count[0] = step_count  # Update the last step count value
            await save_steps_to_db(step_count)

        # Start notifications for heart rate
        print("Starting notifications for heart rate.")
        await client.start_notify(HEART_RATE_CHARACTERISTIC, handle_heart_rate)

        # Start notifications for step count
        print("Starting notifications for step count.")
        await client.start_notify(STEP_COUNT_CHARACTERISTIC, handle_steps)

        # Simulate step count handling with provided test data
        test_data = bytearray(b'\x92\x00\x00x\x00\x00\x07\x00\x00')  # Test data for step count
        await handle_steps(None, test_data)  # Call handle_steps with test data

        # Keep monitoring for a longer period
        await asyncio.sleep(120)  # Monitor for 120 seconds

        # Stop notifications
        await client.stop_notify(HEART_RATE_CHARACTERISTIC)
        await client.stop_notify(STEP_COUNT_CHARACTERISTIC)
        print("Stopped monitoring.")

        # Save the last recorded values to the database
        if last_heart_rate[0] is not None:
            print(f"Saving last heart rate: {last_heart_rate[0]}")
            await save_heart_rate_to_db(last_heart_rate[0])  # Save the last heart rate value
        if last_step_count[0] is not None:
            print(f"Saving last step count: {last_step_count[0]}")
            await save_steps_to_db(last_step_count[0])  # Save the last step count value

# Run the monitoring
asyncio.run(start_monitoring())
