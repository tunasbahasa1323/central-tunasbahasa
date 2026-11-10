import { NextRequest, NextResponse } from "next/server";

const WILAYAH_ENDPOINT = "https://wilayah.cahyadsn.com/apps/inc/geo_ajax.php";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^\d+(\.\d+)*$/.test(id) || id.length > 13) {
    return NextResponse.json({ status: false, error: "Kode wilayah tidak valid" }, { status: 400 });
  }

  try {
    const response = await fetch(`${WILAYAH_ENDPOINT}?id=${encodeURIComponent(id)}`, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) {
      return NextResponse.json({ status: false, error: "Data wilayah tidak tersedia" }, { status: response.status });
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ status: false, error: "Layanan data wilayah sedang tidak tersedia" }, { status: 502 });
  }
}
