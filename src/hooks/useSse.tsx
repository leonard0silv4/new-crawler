import { useEffect } from "react";

interface UseSseOptions<T> {
  eventName: string;
  onEvent: (data: T) => void;
  enabled?: boolean;
}

export function useSse<T>({
  eventName,
  onEvent,
  enabled = true,
}: UseSseOptions<T>) {
  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_BASE_URL}events`
    );

    const handleEvent = (event: MessageEvent) => {
      try {
        const parsedData: T = JSON.parse(event.data);
        onEvent(parsedData);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.addEventListener(eventName, handleEvent);

    return () => {
      eventSource.removeEventListener(eventName, handleEvent);
      eventSource.close();
    };
  }, [eventName, enabled]);
}
