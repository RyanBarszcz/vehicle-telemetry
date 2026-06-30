import { openDB } from "idb";

export type LocalTelemetryPoint = {
    id: string;
    sessionId: string;
    timestamp: string;
    speed_mph: number;
    rpm: number;
    throttle_percent: number;
    coolant_temp_f: number;
    boost_psi?: number | null;
};

const DB_NAME = "car-data-logger";
const DB_VERSION = 1;
const TELEMETRY_STORE = "telemetry_points";

async function getDb() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(TELEMETRY_STORE)) {
                const store = db.createObjectStore(TELEMETRY_STORE, {
                    keyPath: "id",
                });

                store.createIndex("sessionId", "sessionId");
            }
        },
    });
}

export async function saveLocalTelemetryPoint(point: LocalTelemetryPoint) {
    const db = await getDb();
    await db.put(TELEMETRY_STORE, point);
}

export async function getLocalTelemetryPoints(sessionId: string) {
    const db = await getDb();
    return db.getAllFromIndex(TELEMETRY_STORE, "sessionId", sessionId);
}

export async function deleteLocalTelemetryPoints(sessionId: string) {
    const db = await getDb();
    const tx = db.transaction(TELEMETRY_STORE, "readwrite");
    const index = tx.store.index("sessionId");

    let cursor = await index.openCursor(sessionId);

    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }

    await tx.done;
}