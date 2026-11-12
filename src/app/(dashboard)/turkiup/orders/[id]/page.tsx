import { Suspense } from "react";
import OrderDetailPage from "./order-detail-client";


export async function generateStaticParams() { return [{ id: "_" }]; }

export default function Page() {
  return <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuat detail order...</div>}><OrderDetailPage /></Suspense>;
}
