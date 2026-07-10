/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardScanPage() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
		null,
	);

	useEffect(() => {
		// Get user's location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					setLocation({
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					});
					setLoading(false);
				},
				(err) => {
					setError("Unable to get location: " + err.message);
					setLoading(false);
				},
				{ enableHighAccuracy: true },
			);
		} else {
			setError("Geolocation is not supported by this browser");
			setLoading(false);
		}
	}, []);

	const handleManualEntry = () => {
		// For now, redirect to a manual entry page or show a form
		setError(
			"Manual entry coming soon. Please use the QR scanner at the event location.",
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<h2 className="text-xl font-semibold text-gray-900">
						Getting Location...
					</h2>
					<p className="text-gray-600 mt-2">
						Please allow location access when prompted
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<Link
						href="/dashboard"
						className="text-blue-600 hover:text-blue-800 text-sm"
					>
						← Back to Dashboard
					</Link>
					<h1 className="text-2xl font-bold text-gray-900 mt-2">
						Scan QR Code
					</h1>
					<p className="text-gray-600">
						Scan the event QR code to mark your attendance
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
						{error}
					</div>
				)}

				<div className="bg-white rounded-lg shadow-md p-6">
					{location ? (
						<div>
							<div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
								<p className="text-green-800 text-sm">
									✅ Location detected: {location.lat.toFixed(6)},{" "}
									{location.lng.toFixed(6)}
								</p>
							</div>

							<div className="text-center py-8">
								<div className="text-6xl mb-4">📸</div>
								<p className="text-gray-600 mb-4">
									To scan a QR code, you need to use your phone&apos;s camera.
								</p>
								<p className="text-gray-500 text-sm">
									On mobile, you&apos;ll be prompted to allow camera access.
								</p>
							</div>

							<button
								onClick={handleManualEntry}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
							>
								Enter Event Code Manually
							</button>
						</div>
					) : (
						<div className="text-center py-8">
							<div className="text-6xl mb-4">📍</div>
							<p className="text-gray-600">Unable to get your location</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
							>
								Retry
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
