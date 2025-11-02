import { NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/properties", label: "Properties", icon: "🏠" },
  { to: "/admin/reservations", label: "Reservations", icon: "🗂️" },
  { to: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { to: "/admin/payments", label: "Payments", icon: "💳" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function SecondaryNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="sticky top-[56px] z-30 w-full bg-white shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95"
      aria-label="Section navigation"
    >
      <div className="mx-auto max-w-[1400px] px-3 md:px-6">
        <div
          className="flex justify-between md:justify-center gap-1 md:gap-4 lg:gap-6 xl:gap-8 overflow-x-auto py-2 scrollbar-hide"
          role="tablist"
        >
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                role="tab"
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-lg p-1 text-sm font-medium outline-none transition-all duration-200 flex flex-col items-center",
                    "hover:bg-gray-50 hover:text-gray-900 flex-1 md:flex-none",
                    isActive || active
                      ? "bg-teal-50 text-teal-700 border-b-2 border-teal-500 font-semibold"
                      : "text-gray-600",
                    "min-w-[50px] md:min-w-auto",
                  ].join(" ")
                }
              >
                <span className="text-lg md:text-base mb-1 md:mb-0 md:mr-2">
                  {item.icon}
                </span>
                <span className="text-xs hidden sm:block md:text-sm">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
