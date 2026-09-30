// Coordinate resolution for map views.
//
// Primary source: the Motiu CRM "Place" property — Notion type `place`, which the
// API returns as { lat, lon, name, address, ... }. NOTE: Notion calls longitude
// `lon` (not `lng`/`longitude`). notion.ts passes unknown property types through
// as-is, so props["Place"] arrives here as that object whatever the property is
// named/displayed as.
//
// Kept for compatibility: any object-valued property shaped like a location
// ({ latitude, longitude } or { lat, lon }), or number properties named
// Lat/Lng/Latitude/Longitude. Records with an empty Place stay off the map —
// never invent fallback coordinates here.
export interface Coords {
    lat: number;
    lng: number;
}

export interface Place {
    lat: number;
    lng: number;
    /** Place label from Notion (e.g. "Barcelona, Catalonia, Spain"), if any. */
    name: string | null;
    /** Address string from Notion, if any. */
    address: string | null;
}

const clean = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;

export function getPlace(props: Record<string, any>): Place | null {
    // 1. Any object-valued property shaped like a place/location.
    for (const key of Object.keys(props)) {
        const val = props[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
            const rawLat = val.latitude ?? val.lat ?? null;
            const rawLng = val.longitude ?? val.lon ?? null;
            if (rawLat != null && rawLng != null) {
                const lat = Number(rawLat);
                const lng = Number(rawLng);
                if (!isNaN(lat) && !isNaN(lng)) {
                    return {
                        lat,
                        lng,
                        name: clean(val.name),
                        address: clean(val.address),
                    };
                }
            }
        }
    }
    // 2. Plain number properties (first non-null pair wins).
    const rawLat =
        props["Lat"] ??
        props["lat"] ??
        props["Latitude"] ??
        props["latitude"] ??
        props["location_lat"] ??
        props["Location_Lat"];
    const rawLng =
        props["Lng"] ??
        props["lng"] ??
        props["Longitude"] ??
        props["longitude"] ??
        props["location_lng"] ??
        props["Location_Lng"];
    if (rawLat != null && rawLng != null) {
        const lat = Number(rawLat);
        const lng = Number(rawLng);
        if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            return { lat, lng, name: null, address: null };
        }
    }
    return null;
}

export function getCoords(props: Record<string, any>): Coords | null {
    const place = getPlace(props);
    return place ? { lat: place.lat, lng: place.lng } : null;
}
