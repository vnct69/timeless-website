"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface EventDeleteButtonProps {
	eventId: string;
}

export default function EventDeleteButton({ eventId }: EventDeleteButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this event?")) {
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase
				.from("events")
				.delete()
				.eq("id", eventId);

			if (error) throw error;

			router.push("/admin");
			router.refresh();
		} catch (error) {
			console.error("Error deleting event:", error);
			alert("Failed to delete event. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleDelete}
			disabled={isLoading}
			className="text-red-600 hover:text-red-800 text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? "Deleting..." : "Delete Event"}
		</button>
	);
}
