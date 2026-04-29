"use client";

import { useCallback, useState } from "react";

type UseInsightStreamState = {
  error: string | null;
  isStreaming: boolean;
  text: string;
};

export function useInsightStream() {
  const [state, setState] = useState<UseInsightStreamState>({
    error: null,
    isStreaming: false,
    text: ""
  });

  const start = useCallback(async (body: unknown) => {
    setState({
      error: null,
      isStreaming: true,
      text: ""
    });

    try {
      const response = await fetch("/api/insights/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok || !response.body) {
        throw new Error("Insight stream is unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) {
            continue;
          }

          const token = event.slice("data: ".length);

          if (token === "[DONE]") {
            setState((current) => ({
              ...current,
              isStreaming: false
            }));
            return;
          }

          setState((current) => ({
            ...current,
            text: `${current.text}${token}`
          }));
        }
      }

      setState((current) => ({
        ...current,
        isStreaming: false
      }));
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Insight stream failed.",
        isStreaming: false,
        text: ""
      });
    }
  }, []);

  return {
    ...state,
    start
  };
}
