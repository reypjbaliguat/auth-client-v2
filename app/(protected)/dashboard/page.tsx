"use client";

import ProtectedRoute from "@/core/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Only visible to authenticated users.</p>
      </main>
    </ProtectedRoute>
  );
}
