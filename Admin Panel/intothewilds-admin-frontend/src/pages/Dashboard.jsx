import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import KpiCard from "../components/common/KpiCard";
import { Skeleton } from "../components/common/Skeleton";
import { currencyINR, number, percent } from "../utils/format";
import DateRangeBar, {
  quickRanges,
} from "../components/dashboard/DateRangeBar";
import BookingCalendar from "../components/dashboard/BookingCalendar";
import EarningsChart from "../components/dashboard/EarningsChart";
import ToursEventsAnalytics from "../components/dashboard/ToursEventsAnalytics";
import UpcomingList from "../components/dashboard/UpcomingList";

export default function Dashboard() {
  const [kpiRange, setKpiRange] = useState(quickRanges.today());
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);

  const kpiQs = `?from=${kpiRange.start.toISOString()}&to=${kpiRange.end.toISOString()}`;

  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get(`/dashboard/summary${kpiQs}`);
        // backend returns:
        // {
        //   revenue, netRevenue,
        //   bookings: { total, cancelled, confirmed, checkedIn, checkedOut },
        //   nights: { booked, sellable, occupancy },
        //   adr, cancellationRate, payments: {...}, range: {...}
        // }
        const total = data?.bookings?.total ?? 0;
        const cancelled = data?.bookings?.cancelled ?? 0;

        const mapped = {
          bookings: total,
          nights: data?.nights?.booked ?? 0,
          revenue: data?.revenue ?? 0,
          adr: data?.adr ?? 0,
          occupancy: data?.nights?.occupancy ?? 0, // 0..1
          // show booked/sellable so the hint "Booked X / Y" makes sense
          roomsBooked: data?.nights?.booked ?? 0,
          roomsTotal: data?.nights?.sellable ?? 0,
          cancellationRate:
            data?.cancellationRate ?? (total ? cancelled / total : 0),
          // keep these for future deltas/refunds
          refundRequests: 0,
          deltaBookings: 0,
          deltaRevenue: 0,
          deltaOccupancy: 0,
          deltaCancellations: 0,
          deltaRefunds: 0,
        };

        if (!abort) setKpis(mapped);
      } catch (e) {
        console.error(e);
        if (!abort) setKpis(null);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [kpiQs]);

  return (
    <div className="min-h-screen pb-10">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Live performance overview across all channels
          </p>
        </div>
        <div className="flex-shrink-0">
          <DateRangeBar value={kpiRange} onChange={setKpiRange} />
        </div>
      </header>

      {/* KPI GRID */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        {loading || !kpis ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <KpiCard
              icon="📅"
              label={`Bookings (${kpiRange.label})`}
              value={number(kpis.bookings)}
              hint={`Nights: ${number(kpis.nights)}`}
              tone="default"
              delta={kpis.deltaBookings}
            />
            <KpiCard
              icon="💰"
              label={`Revenue (${kpiRange.label})`}
              value={currencyINR(kpis.revenue)}
              hint={`ADR: ${currencyINR(kpis.adr)}`}
              tone="success"
              delta={kpis.deltaRevenue}
            />
            <KpiCard
              icon="🏨"
              label="Occupancy Rate"
              value={percent(kpis.occupancy)}
              hint={`Booked ${number(kpis.roomsBooked)} / ${number(
                kpis.roomsTotal
              )}`}
              tone="default"
              delta={kpis.deltaOccupancy}
            />
            <KpiCard
              icon="↩️"
              label="Cancellation Rate"
              value={percent(kpis.cancellationRate)}
              hint="Lower is better"
              tone={kpis.cancellationRate > 0.05 ? "danger" : "success"}
              delta={kpis.deltaCancellations}
            />
            <KpiCard
              icon="💸"
              label="Refund Requests"
              value={number(kpis.refundRequests)}
              hint="Awaiting action"
              tone="warn"
              delta={kpis.deltaRefunds}
            />
          </>
        )}
      </section>

      {/* Middle Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 h-[500px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <UpcomingList />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 h-[500px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <BookingCalendar />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm p-4 h-[500px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <EarningsChart />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 h-[500px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <ToursEventsAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}
