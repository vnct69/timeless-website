// import { createClient } from "@/lib/supabase/server";
// import { notFound, redirect } from "next/navigation";
// import ScanHandler from "./ScanHandler";

// interface ScanPageProps {
// 	params: Promise<{
// 		token: string;
// 	}>;
// }

// export default async function ScanPage({ params }: ScanPageProps) {
// 	// ✅ Await the params Promise
// 	const { token } = await params;

// 	const supabase = await createClient();

// 	// Validate QR token
// 	const { data: event, error } = await supabase
// 		.from("events")
// 		.select("*")
// 		.eq("qr_code_token", token)
// 		.single();

// 	if (error || !event) {
// 		notFound();
// 	}

// 	// Check if QR code is expired
// 	const isExpired = new Date(event.qr_code_expiry) < new Date();

// 	if (isExpired || !event.is_active) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
// 				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
// 					<div className="text-red-600 text-6xl mb-4">⛔</div>
// 					<h1 className="text-2xl font-bold text-gray-900 mb-2">
// 						QR Code Expired
// 					</h1>
// 					<p className="text-gray-600">
// 						This QR code is no longer valid. Please contact the event organizer.
// 					</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	// Check if user is logged in
// 	const {
// 		data: { user },
// 	} = await supabase.auth.getUser();

// 	if (!user) {
// 		// Redirect to login with return URL
// 		const returnUrl = `/scan/${token}`;
// 		redirect(`/login?redirect=${encodeURIComponent(returnUrl)}`);
// 	}

// 	// User is logged in, render scanner
// 	return <ScanHandler event={event} userId={user.id} />;
// }




import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ScanHandler from "./ScanHandler";

// ✅ This tells Next.js not to statically generate this page
export const dynamic = 'force-dynamic';

interface ScanPageProps {
	params: Promise<{
		token: string;
	}>;
}

export default async function ScanPage({ params }: ScanPageProps) {
	const { token } = await params;

	const supabase = await createClient();

	const { data: event, error } = await supabase
		.from("events")
		.select("*")
		.eq("qr_code_token", token)
		.single();

	if (error || !event) {
		notFound();
	}

	const isExpired = new Date(event.qr_code_expiry) < new Date();

	if (isExpired || !event.is_active) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
					<div className="text-red-600 text-6xl mb-4">⛔</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						QR Code Expired
					</h1>
					<p className="text-gray-600">
						This QR code is no longer valid. Please contact the event organizer.
					</p>
				</div>
			</div>
		);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		const returnUrl = `/scan/${token}`;
		redirect(`/login?redirect=${encodeURIComponent(returnUrl)}`);
	}

	return <ScanHandler event={event} userId={user.id} />;
}