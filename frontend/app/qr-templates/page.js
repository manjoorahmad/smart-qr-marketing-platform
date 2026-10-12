
"use client";
import { useState } from "react";
import QRStandeeDesigner from "./QRStandeeDesigner";

export default function QRTemplatesPage() {
  return (
    <main
      style={{
        minHeight: "100%",
        padding: "24px",
        color: "var(--text-primary, #111827)",
      }}
    >
      <QRStandeeDesigner />
    </main>
  );
}
