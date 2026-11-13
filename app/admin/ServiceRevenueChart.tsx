"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ServiceRevenue = {
  service: string;
  currency: string;
  amount_minor: number;
};

export default function ServiceRevenueChart({ rows }: { rows: ServiceRevenue[] }) {
  const currencies = new Map<string, ServiceRevenue[]>();
  for (const row of rows) {
    const group = currencies.get(row.currency) ?? [];
    group.push(row);
    currencies.set(row.currency, group);
  }

  return (
    <section aria-labelledby="service-revenue-heading" className="rounded-xl border bg-white p-6">
      <h2 id="service-revenue-heading" className="text-lg font-semibold">
        Revenue by Service
      </h2>
      <p className="mt-1 text-sm text-neutral-500">All-time paid invoices, net of refunds</p>

      {currencies.size === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No paid service invoices yet.</p>
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
        const data = group.map(({ service, amount_minor }) => ({
          service: service.replace(/[-_]+/g, " "),
          revenue: amount_minor / divisor,
        }));

        return (
          <div key={currency} className="mt-5 min-w-0">
            <h3 className="mb-2 text-sm font-medium text-neutral-600">{currency}</h3>
            <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44 + 36)}>
              <BarChart data={data} layout="vertical" margin={{ right: 24 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => axisMoney.format(value)}
                />
                <YAxis
                  type="category"
                  dataKey="service"
                  width={110}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: string) => value.length > 16 ? value.slice(0, 15) + "…" : value}
                />
                <Tooltip
                  formatter={(value: unknown): [string, string] => [
                    money.format(Number(value)),
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#262626" maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </section>
  );
}
