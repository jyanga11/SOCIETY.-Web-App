"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
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

export default function ServiceRevenueChart({ rows }: { rows: ServiceRevenue[] }) {
  const [range, setRange] = useState<Range>("all");
  const currencies = new Map<string, ServiceRevenue[]>();
  for (const row of rows) {
    const amount = range === "all" ? row.amount_minor : row.recent_amounts?.[range];
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
            Revenue by Service
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Paid invoices, net of refunds</p>
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
        <p className="mt-4 text-sm text-neutral-500">No paid service invoices in this time range.</p>
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
        const data = group.sort((a, b) => b.amount_minor - a.amount_minor).map(({ service, amount_minor }) => ({
          service: service.replace(/[-_]+/g, " "),
          revenue: amount_minor / divisor,
        }));

        return (
          <div key={currency} className="mt-5 min-w-0">
            <h3 className="mb-2 text-sm font-medium text-neutral-600">{currency}</h3>
            <div className="overflow-x-auto">
              <div style={{ minWidth: data.length * 115 + 64 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} margin={{ right: 16 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      tickFormatter={(value: string) =>
                        value.length > 16 ? value.slice(0, 15) + "…" : value
                      }
                    />
                    <YAxis type="number" tickFormatter={(value: number) => axisMoney.format(value)} />
                    <Tooltip formatter={(value: unknown): [string, string] => [
                      money.format(Number(value)), "Revenue",
                    ]} />
                    <Bar dataKey="revenue" fill="#262626" maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
