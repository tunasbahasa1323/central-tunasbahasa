import crypto from "node:crypto";
import { NextResponse } from "next/server";

function signDeliveryPath(pathname: string, cloudName: string, apiSecret: string) {
  const path = pathname.replace(/^\/+/, "").replace(new RegExp(`^${cloudName}/`), "");
  const marker = "/upload/";
  const markerIndex = path.indexOf(marker);
  if (markerIndex < 0) return null;
  const prefix = path.slice(0, markerIndex);
  const resourcePath = path.slice(markerIndex + marker.length);
  const signature = crypto.createHash("sha1").update(`${resourcePath}${apiSecret}`).digest("base64url").slice(0, 8);
  return `/${prefix}/authenticated/s--${signature}--/${resourcePath}`;
}

export async function GET(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const rawUrl = new URL(request.url).searchParams.get("url");
  if (!cloudName || !apiSecret || !rawUrl) return NextResponse.json({ error: "Cloudinary signed preview belum dikonfigurasi." }, { status: 503 });

  let source: URL;
  try { source = new URL(rawUrl); } catch { return NextResponse.json({ error: "URL bukti pembayaran tidak valid." }, { status: 400 }); }
  if (source.hostname !== "res.cloudinary.com" || source.pathname.split("/")[1] !== cloudName) return NextResponse.json({ error: "URL Cloudinary tidak valid." }, { status: 400 });
  const deliveryPath = source.pathname.replace(new RegExp(`^/${cloudName}`), "");
  const response = await fetch(`https://res.cloudinary.com/${cloudName}${deliveryPath}`);
  if (!response.ok) {
    return NextResponse.json({ error: "Bukti pembayaran tidak dapat diakses. Silakan upload ulang setelah konfigurasi Cloudinary diperbaiki." }, { status: response.status });
  }
  const isPdf = new URL(request.url).searchParams.get("type") === "pdf";
  return new Response(response.body, { status: 200, headers: { "Content-Type": isPdf ? "application/pdf" : (response.headers.get("content-type") ?? "image/jpeg"), "Content-Disposition": isPdf ? "inline; filename=payment-proof.pdf" : "inline", "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
}
