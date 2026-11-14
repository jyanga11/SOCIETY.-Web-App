"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export default function TrackAnalytics({
  event,
  eventKey,
}: {
  event: AnalyticsEvent;
  eventKey: string;
}) {
  const lastEventKey = useRef<string | null>(null);

  useEffect(() => {
    if (lastEventKey.current === eventKey) return;
    lastEventKey.current = eventKey;
    trackEvent(event);
  }, [event, eventKey]);

  return null;
}



