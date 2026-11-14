export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_variant?: string;
};

export type EcommerceDetails = {
  currency: string;
  // Merchandise subtotal in currency units, excluding tax and shipping.
  value: number;
  items: [EcommerceItem, ...EcommerceItem[]];
};

export type PurchaseDetails = EcommerceDetails & {
  // Use the same stable order ID on every visit to the confirmation page.
  transaction_id: string;
  tax?: number;
  shipping?: number;
};

export type AnalyticsEvent =
  | { event: "view_item" | "begin_checkout"; ecommerce: EcommerceDetails }
  | { event: "purchase"; ecommerce: PurchaseDetails }
  | { event: "view_service" | "generate_lead"; service_type: string };

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const browser = window as Window & {
    dataLayer?: (AnalyticsEvent | { ecommerce: null })[];
  };
  const dataLayer = (browser.dataLayer ??= []);

  if ("ecommerce" in event) {
    dataLayer.push({ ecommerce: null });
  }

  dataLayer.push(event);
}
