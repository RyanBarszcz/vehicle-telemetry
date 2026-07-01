export type Vehicle = {
    id: string;
    year: number;
    make: string;
    model: string;
    trim?: string | null;
    nickname?: string | null;
    vin?: string | null;
    image_url?: string | null;

    session_count?: number;
    last_session_at?: string | null;
    max_rpm?: number | null;
    max_speed_mph?: number | null;
    total_distance_miles?: number | null;
};