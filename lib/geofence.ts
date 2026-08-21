// Straight-line distance between two lat/lng points, in meters (Haversine
// formula). Good enough for a campus-radius check — no need for anything
// more precise than a phone GPS's own accuracy at this scale.
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinGeofence(
  school: { latitude: number | null; longitude: number | null; geofenceRadius: number | null },
  point: { lat: number; lng: number }
): { ok: boolean; distance?: number; reason?: string } {
  const lat = school.latitude;
  const lng = school.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, reason: "School location isn't set up yet — ask an admin to configure it in Settings > School Profile." };
  }
  const distance = distanceMeters(lat as number, lng as number, point.lat, point.lng);
  const radius = school.geofenceRadius ?? 150;
  if (distance > radius) {
    return { ok: false, distance, reason: `You're ${Math.round(distance)}m from the school — attendance can only be marked within ${radius}m of the school.` };
  }
  return { ok: true, distance };
}
