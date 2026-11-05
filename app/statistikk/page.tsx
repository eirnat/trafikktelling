import type { Metadata } from "next";
import { DashboardSection } from "../DashboardSection";

export const metadata: Metadata = {
  title: "Statistikk – Trafikktelling",
  description: "Statistikk fra trafikktellingen.",
};

export default function StatistikkPage() {
  return (
    <main>
      <DashboardSection />
    </main>
  );
}
