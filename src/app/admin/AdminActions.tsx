"use client";

import { useRouter } from "next/navigation";

interface AdminActionsProps {
	children?: React.ReactNode;
}

export default function AdminActions({ children }: AdminActionsProps) {
	const router = useRouter();

	const handleNavigate = (path: string) => {
		router.push(path);
	};

	return <>{children}</>;
}
