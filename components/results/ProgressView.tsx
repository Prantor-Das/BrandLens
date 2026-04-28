"use client"
import React, { useEffect, useMemo, useState } from "react"
import { ProgressBar } from "@/components/ui/ProgressBar"

type Props = {
  status: string
  percentComplete?: number
  enabledModels: string[]
}

const MODEL_COLORS: Record<string, string> = {
  GPT: "bg-blue-500",
  Gemini: "bg-green-500",
  Claude: "bg-purple-500",
}

function ModelIcon({ name }: { name: string }) {
  const initials = name.split(" ")[0].slice(0, 3).toUpperCase()
  const color = MODEL_COLORS[name] ?? "bg-gray-400"
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${color}`}>
      <span className="text-sm font-medium">{initials}</span>
    </div>
  )
}

export default function ProgressView({ status, percentComplete = 0, enabledModels }: Props) {
  const [cycleIndex, setCycleIndex] = useState(0)
  const cycle = useMemo(() => {
    return [...enabledModels, "Extracting brand mentions...", "Computing scores...", "Generating insights..."]
  }, [enabledModels])

  useEffect(() => {
    const id = setInterval(() => setCycleIndex((i) => (i + 1) % cycle.length), 1800)
    return () => clearInterval(id)
  }, [cycle.length])

  const etaSeconds = useMemo(() => {
    if (percentComplete <= 0) return 30
    const remaining = Math.max(0, 100 - percentComplete)
    return Math.round((remaining / 100) * 30)
  }, [percentComplete])

  const current = cycle[cycleIndex]
  const queryingText = cycleIndex < enabledModels.length ? `Querying ${current}...` : current

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
      <div className="flex items-center gap-3">
        {enabledModels.slice(0, 3).map((m) => (
          <ModelIcon key={m} name={m} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold">{queryingText}</h2>
      <div className="w-full max-w-xl">
        <ProgressBar
          className="animate-fade-in-up"
          label={status === "RUNNING" ? "Analysis progress" : "Queue progress"}
          value={percentComplete}
        />
      </div>
      <div className="text-sm text-slate-500">Estimated time remaining: {etaSeconds}s</div>
    </div>
  )
}
