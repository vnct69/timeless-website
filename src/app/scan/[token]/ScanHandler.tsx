/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Event {
	id: string;
	title: string;
	latitude: number;
	longitude: number;
	radius_meters: number;
}

interface ScanHandlerProps {
	event: Event;
	userId: string;
}

export default function ScanHandler({ event, userId }: ScanHandlerProps) {
	const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	// Calculate distance between two coordinates
	const calculateDistance = useCallback(
		(lat1: number, lon1: number, lat2: number, lon2: number) => {
			const R = 6371; // Earth's radius in km
			const dLat = ((lat2 - lat1) * Math.PI) / 180;
			const dLon = ((lon2 - lon1) * Math.PI) / 180;
			const a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos((lat1 * Math.PI) / 180) *
					Math.cos((lat2 * Math.PI) / 180) *
					Math.sin(dLon / 2) *
					Math.sin(dLon / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return R * c;
		},
		[],
	);

	// Record attendance
	const recordAttendance = useCallback(
		async (lat: number, lng: number, accuracy: number) => {
			try {
				const { error: insertError } = await supabase
					.from("attendance_records")
					.insert({
						user_id: userId,
						event_id: event.id,
						scan_latitude: lat,
						scan_longitude: lng,
						location_accuracy_meters: accuracy,
						verification_status: "approved",
						trust_score: 100,
					});

				if (insertError) throw insertError;

				setSuccess(true);
				setLoading(false);

				// Redirect after 3 seconds
				setTimeout(() => {
					router.push("/dashboard");
				}, 3000);
			} catch (err: any) {
				setError("Failed to record attendance: " + err.message);
				setLoading(false);
			}
		},
		[event.id, userId, supabase, router],
	);

	// Handle location and attendance
	const handleLocationAndAttendance = useCallback(
		async (position: GeolocationPosition) => {
			const { latitude, longitude, accuracy } = position.coords;
			setLocation({ lat: latitude, lng: longitude });

			// Check if user is within geofence
			const distance = calculateDistance(
				event.latitude,
				event.longitude,
				latitude,
				longitude,
			);

			const isWithinGeofence = distance <= event.radius_meters / 1000; // Convert to km

			if (!isWithinGeofence) {
				setError(
					`You are ${(distance * 1000).toFixed(0)} meters away from the event location. Must be within ${event.radius_meters} meters.`,
				);
				setLoading(false);
				return;
			}

			// Record attendance
			await recordAttendance(latitude, longitude, accuracy);
		},
		[event, calculateDistance, recordAttendance],
	);

	// Handle geolocation error
	const handleGeolocationError = useCallback(
		(err: GeolocationPositionError) => {
			setError("Unable to get your location: " + err.message);
			setLoading(false);
		},
		[],
	);

	useEffect(() => {
		// Check if geolocation is supported
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			setLoading(false);
			return;
		}

		// Get user's location
		navigator.geolocation.getCurrentPosition(
			handleLocationAndAttendance,
			handleGeolocationError,
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
		);
	}, [handleLocationAndAttendance, handleGeolocationError]);

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<h2 className="text-xl font-semibold text-gray-900">
						Processing Attendance
					</h2>
					<p className="text-gray-600 mt-2">Verifying your location...</p>
					<p className="text-gray-400 text-xs mt-4">
						Please allow location access when prompted
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
					<div className="text-red-600 text-6xl mb-4">❌</div>
					<h2 className="text-xl font-bold text-gray-900 mb-2">
						Attendance Failed
					</h2>
					<p className="text-gray-600">{error}</p>
					<div className="flex gap-3 mt-4 justify-center">
						<button
							onClick={() => {
								setError(null);
								setLoading(true);
								navigator.geolocation.getCurrentPosition(
									handleLocationAndAttendance,
									handleGeolocationError,
									{ enableHighAccuracy: true },
								);
							}}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
						>
							Retry
						</button>
						<button
							onClick={() => router.push("/dashboard")}
							className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
						>
							Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Success state
	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
					<div className="text-green-600 text-6xl mb-4">✅</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Attendance Recorded!
					</h2>
					<p className="text-gray-600">
						You have successfully checked in to {event.title}
					</p>
					<div className="mt-4 text-sm text-gray-500">
						Redirecting to dashboard...
					</div>
				</div>
			</div>
		);
	}

	return null;
}
