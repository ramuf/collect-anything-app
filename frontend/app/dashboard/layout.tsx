"use client";

import { usePathname } from 'next/navigation';
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  // Hide the global dashboard sidebar when viewing a project detail page
  // (e.g. /dashboard/projects/<uuid>) so the project can render its own sidebar.
  // Note: For this rebuild, we might want to keep the main sidebar always visible or handle it differently.
  // For now, I'll keep the logic but use the new components.
  // Hide the global dashboard sidebar when viewing a project detail page
  // (e.g. /dashboard/projects/<uuid> and its sub-routes) so the project can render its own sidebar.
  const isProjectDetail = /^\/dashboard\/projects\/[^/]+/.test(pathname);

  // Hide the TopBar for form builder and view builder pages since they have their own headers
  const isFormBuilder = /\/forms\/[^/]+$/.test(pathname);
  const isViewBuilder = /\/views\/[^/]+(\/edit)?$/.test(pathname);
  const hasOwnHeader = isFormBuilder || isViewBuilder;

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      {/* Sidebar is fixed */}
      {!isProjectDetail && <Sidebar />}

      {/* Main Content Area */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: !isProjectDetail ? "var(--sidebar-width, 16rem)" : "0",
        }}
      >
        {!hasOwnHeader && <TopBar />}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
