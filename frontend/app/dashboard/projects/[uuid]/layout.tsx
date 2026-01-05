"use client";

import { usePathname } from "next/navigation";
import ProjectSidebar from "./components/ProjectSidebar";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isFormBuilder = /\/forms\/[^/]+$/.test(pathname);
  const isViewBuilder = /\/views\/[^/]+(\/edit)?$/.test(pathname);
  const hasOwnLayout = isFormBuilder || isViewBuilder;

  // Render the project-local sidebar (fixed) and then the page children.
  // The parent dashboard layout will hide its global sidebar for this route.
  // Hide the project sidebar for form/view builders since they have their own full-screen layouts.
  return (
    <>
      {!hasOwnLayout && <ProjectSidebar />}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: !hasOwnLayout ? "var(--sidebar-width, 16rem)" : "0",
        }}
      >
        {children}
      </div>
    </>
  );
}
