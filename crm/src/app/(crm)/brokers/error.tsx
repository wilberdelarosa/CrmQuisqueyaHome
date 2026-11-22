"use client";

import { ErrorDeModulo } from "../_ui/estados";

export default function ErrorDelModulo({ reset }: { error: Error; reset: () => void }) {
  return <ErrorDeModulo nombre="Brokers" reset={reset} />;
}
