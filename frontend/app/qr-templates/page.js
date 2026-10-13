
"use client";

import DashboardLayout from "../components/DashboardLayout";
import QRStandeeDesigner from "./QRStandeeDesigner";

export default function QRTemplatesPage() {
  return (
    <DashboardLayout>
      <main
        style={{
          minHeight: "100%",
          padding: "24px",
          color: "var(--text-primary, #111827)",
        }}
      >
        <QRStandeeDesigner />
      </main>
    </DashboardLayout>
  );
}
