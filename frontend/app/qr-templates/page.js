"use client";
import DashboardLayout from "../components/DashboardLayout";
import QRStandeeDesigner from "./QRStandeeDesigner";

export default function QRTemplatesPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: "24px", minHeight: "100%" }}>
        <QRStandeeDesigner />
      </div>
    </DashboardLayout>
  );
}
