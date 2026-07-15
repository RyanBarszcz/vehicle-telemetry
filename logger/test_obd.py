import obd

print("Scanning for OBD adapters...")
ports = obd.scan_serial()
print(f"Found ports: {ports}")

if not ports:
    print("❌ No OBD adapter detected.")
    exit()

print(f"\nConnecting to {ports[0]}...")

connection = obd.OBD(
    portstr=ports[0],
    fast=False,
    timeout=10,
)

print(f"Connection status: {connection.status()}")

if not connection.is_connected():
    print("❌ Failed to connect to vehicle.")
    exit()

print("✅ Connected to vehicle!")

print("\nTesting a few PIDs...")

for name, command in [
    ("RPM", obd.commands.RPM),
    ("Speed", obd.commands.SPEED),
    ("Throttle", obd.commands.THROTTLE_POS),
    ("Coolant", obd.commands.COOLANT_TEMP),
]:
    response = connection.query(command)
    print(f"{name}: {response.value}")

connection.close()