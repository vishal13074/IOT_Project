import asyncio
from bleak import BleakScanner

async def scan_devices():
    print("Scanning for devices...")
    devices = await BleakScanner.discover()
    for device in devices:
        print(device.address, device.name)

asyncio.run(scan_devices())
