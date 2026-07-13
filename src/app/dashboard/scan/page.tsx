// // This is a Server Component that tells Next.js not to pre-render
// export const dynamic = 'force-dynamic';

// // Import the client component
// import DashboardScanClient from './DashboardScanClient';

// export default function DashboardScanPage() {
//   // This server component just renders the client component
//   // The force-dynamic export prevents static generation
//   return <DashboardScanClient />;
// }


// This is a Server Component that tells Next.js not to pre-render
export const dynamic = 'force-dynamic';

// Import the client component
import DashboardScanClient from './DashboardScanClient';

export default function DashboardScanPage() {
  return <DashboardScanClient />;
}