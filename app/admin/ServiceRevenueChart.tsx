"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ranges = {
  all: "All-time",
  year: "Last year",
  month: "Last month",
  week: "Last week",
  day: "24 hours",
} as const;

type Range = keyof typeof ranges;

export type ServiceRevenue = {
  service: string;
  currency: string;
  amount_minor: number;
  recent_amounts: Record<Exclude<Range, "all">, number | null>;
};

export type RevenueTimeline = Partial<Record<Range, ServiceRevenue[]>>;

const charts = [
  { title: "Revenue by Service", description: "Paid invoices, net of refunds" },
  { title: "Revenue by Product", description: "Paid product line items, before refunds" },
  { title: "Revenue over Time", description: "Order and invoice payments, net of refunds, in UTC" },
] as const;

export default function ServiceRevenueChart({
  rows, products, timeline,
}: {
  rows: ServiceRevenue[];
  products: ServiceRevenue[];
  timeline: RevenueTimeline;
}) {
  const [range, setRange] = useState<Range>("all");
  const [chart, setChart] = useState(0);
  const overTime = chart === 2;
  const selectedRows = overTime ? timeline[range] ?? [] : chart === 1 ? products : rows;
  const Chart = overTime ? LineChart : BarChart;

  function moveChart(direction: number) {
    setChart((current) => (current + direction + charts.length) % charts.length);
  }

  const currencies = new Map<string, ServiceRevenue[]>();
  for (const row of selectedRows) {
    const amount = overTime || range === "all" ? row.amount_minor : row.recent_amounts?.[range];
    if (amount == null) continue;

    const group = currencies.get(row.currency) ?? [];
    group.push({ ...row, amount_minor: amount });
    currencies.set(row.currency, group);
  }

  return (
    <section aria-labelledby="service-revenue-heading" className="rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="service-revenue-heading" className="text-lg font-semibold">
            <select
              aria-label="Revenue chart"
              className="rounded-md border bg-white px-3 py-2"
              value={chart}
              onChange={(event) => setChart(Number(event.target.value))}
            >
              {charts.map(({ title }, index) => <option key={title} value={index}>{title}</option>)}
            </select>
            <button type="button" aria-label="Previous chart" className="ml-2 px-2 py-2" onClick={() => moveChart(-1)}>←</button>
            <button type="button" aria-label="Next chart" className="px-2 py-2" onClick={() => moveChart(1)}>→</button>
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{charts[chart].description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Time range
          <select
            className="rounded-md border bg-white px-3 py-2"
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
          >
            {Object.entries(ranges).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {currencies.size === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No revenue data in this time range.</p>
      )}

      {Array.from(currencies, ([currency, group]) => {
        const money = new Intl.NumberFormat("en-US", { style: "currency", currency });
        const axisMoney = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          notation: "compact",
        });
        const digits = money.resolvedOptions().maximumFractionDigits ?? 2;
        // Stripe encodes ISK and UGX invoice amounts with two decimal places.
        const divisor = 10 ** (currency === "ISK" || currency === "UGX" ? 2 : digits);
        const dateLabel = new Intl.DateTimeFormat("en-US", {
          timeZone: "UTC",
          ...(range === "day" ? { hour: "numeric", minute: "2-digit" }
            : range === "all" ? { month: "short", year: "numeric" }
            : { month: "short", day: "numeric" }),
        });
        const data = group.sort((a, b) =>
          overTime ? a.service.localeCompare(b.service) : b.amount_minor - a.amount_minor
        ).map(({ service, amount_minor }) => ({
          service: overTime ? Date.parse(service) : service.replace(/[-_]+/g, " "),
          revenue: amount_minor / divisor,
        }));

        return (
          <div key={currency} className="mt-5 min-w-0">
            <h3 className="mb-2 text-sm font-medium text-neutral-600">{currency}</h3>
            <div className="overflow-x-auto">
              <div style={{ minWidth: overTime ? 280 : data.length * 115 + 64 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <Chart data={data} margin={{ right: 16 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 12 }}
                      type={overTime ? "number" : "category"}
                      scale={overTime ? "time" : "auto"}
                      domain={overTime ? ["dataMin", "dataMax"] : undefined}
                      interval={overTime ? "preserveStartEnd" : 0}
                      tickFormatter={(value: string | number) => overTime
                        ? dateLabel.format(Number(value))
                        : String(value).length > 16 ? String(value).slice(0, 15) + "…" : String(value)
                      }
                    />
                    <YAxis type="number" tickFormatter={(value: number) => axisMoney.format(value)} />
                    <Tooltip labelFormatter={(value: unknown) => overTime ? dateLabel.format(Number(value)) : String(value)} formatter={(value: unknown): [string, string] => [
                      money.format(Number(value)), "Revenue",
                    ]} />
                    {overTime
                      ? <Line dataKey="revenue" stroke="#262626" strokeWidth={2} dot={data.length < 25} />
                      : <Bar dataKey="revenue" fill="#262626" maxBarSize={42} />}
                  </Chart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
