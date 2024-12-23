import { useEffect } from "react";

interface UseSseOptions<T> {
  eventName: string;
  onEvent: (data: T) => void;
}

export function useSse<T>({ eventName, onEvent }: UseSseOptions<T>) {
  useEffect(() => {
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
      eventSource.close();
    };
  }, []);
}
