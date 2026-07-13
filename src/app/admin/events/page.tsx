import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPhilippineTime } from "@/lib/date-utils";
import DeleteEventButton from "./DeleteEventButton";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
	await requireAdmin();

	const supabase = await createClient();

	const { data: events, error } = await supabase
		.from("events")
		.select(
			`
      *,
      attendance_records (id)
    `,
		)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching events:", error);
	}

	const eventsWithCount =
		events?.map((event) => ({
			...event,
			attendance_count: event.attendance_records?.length || 0,
		})) || [];

	const totalAttendance = eventsWithCount.reduce(
		(sum, event) => sum + event.attendance_count,
		0,
	);

	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-6 flex flex-wrap items-center justify-between">
					<div>
						<Link
							href="/admin"
							className="text-blue-600 hover:text-blue-800 text-sm"
						>
							← Back to Dashboard
						</Link>
						<h1 className="text-2xl font-bold text-gray-900 mt-2">My Events</h1>
						<p className="text-gray-600">
							Manage all your events and track attendance
						</p>
					</div>
					<Link
						href="/admin/events/new"
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
					>
						<span className="text-xl">➕</span> Create New Event
					</Link>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-sm font-medium text-gray-500">Total Events</h3>
						<p className="text-3xl font-bold text-gray-900">
							{eventsWithCount.length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-sm font-medium text-gray-500">
							Total Attendance
						</h3>
						<p className="text-3xl font-bold text-gray-900">
							{totalAttendance}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-sm font-medium text-gray-500">Active Events</h3>
						<p className="text-3xl font-bold text-gray-900">
							{eventsWithCount.filter((e) => e.is_active).length}
						</p>
					</div>
				</div>

				{/* Events Table */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Event
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Attendance
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{eventsWithCount.length > 0 ? (
									eventsWithCount.map((event) => {
										const isExpired =
											new Date(event.qr_code_expiry) < new Date();
										const isActive = event.is_active && !isExpired;

										return (
											<tr
												key={event.id}
												className="hover:bg-gray-50 transition-colors"
											>
												<td className="px-6 py-4">
													<div>
														<div className="text-sm font-medium text-gray-900">
															{event.title}
														</div>
														{event.description && (
															<div className="text-xs text-gray-500 truncate max-w-xs">
																{event.description}
															</div>
														)}
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm text-gray-600">
														{event.location_name || "Not specified"}
													</div>
													<div className="text-xs text-gray-400">
														{event.latitude}, {event.longitude}
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm text-gray-600">
														{formatPhilippineTime(new Date(event.created_at))}
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm font-semibold text-gray-900">
														{event.attendance_count}
													</div>
												</td>
												<td className="px-6 py-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															isActive
																? "bg-green-100 text-green-800"
																: "bg-red-100 text-red-800"
														}`}
													>
														{isActive ? "Active" : "Inactive"}
													</span>
													{isExpired && (
														<span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
															Expired
														</span>
													)}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center gap-2">
														<Link
															href={`/admin/events/${event.id}`}
															className="text-blue-600 hover:text-blue-800 text-sm"
														>
															View
														</Link>
														{/* <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Edit
                            </Link> */}
														<Link
															href={`/admin/events/${event.id}/edit`}
															className="text-blue-600 hover:text-blue-800 text-sm"
														>
															Edit
														</Link>
														{/* ✅ Use the DeleteEventButton component directly */}
														<DeleteEventButton
															eventId={event.id}
															eventTitle={event.title}
														/>
													</div>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center">
											<div className="text-4xl mb-4">📭</div>
											<p className="text-gray-600">No events created yet</p>
											<Link
												href="/admin/events/new"
												className="inline-block mt-4 text-blue-600 hover:text-blue-800"
											>
												Create your first event →
											</Link>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
