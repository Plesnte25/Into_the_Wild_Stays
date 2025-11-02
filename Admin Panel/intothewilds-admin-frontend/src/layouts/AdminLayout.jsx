import SecondaryNav from "../ui/SecondaryNav";
import Topbar from "../ui/Topbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-dark-space text-light-grey">
      <Topbar />
      <SecondaryNav />
      <main className="mx-auto max-w-full px-3 py-4 md:px-6 md:py-6">
        {/* routed page content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-dark-space">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
