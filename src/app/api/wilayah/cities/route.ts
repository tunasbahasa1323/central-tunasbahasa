import { NextResponse } from "next/server";

const WILAYAH_ENDPOINT = "https://wilayah.cahyadsn.com/apps/inc/geo_ajax.php";
const provinceCodes = ["11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "31", "32", "33", "34", "35", "36", "51", "52", "53", "61", "62", "63", "64", "65", "71", "72", "73", "74", "75", "76", "81", "82", "91", "92", "93", "94", "95", "96"];

function parseOptions(html: string) {
  return Array.from(html.matchAll(/<option value='([^']+)'>([^<]+)<\/option>/g)).map((match) => ({ code: match[1], name: match[2] }));
}

export async function GET() {
  try {
    const responses = await Promise.all(provinceCodes.map((code) => fetch(`${WILAYAH_ENDPOINT}?id=${code}`, { next: { revalidate: 86400 } })));
    const cities = (await Promise.all(responses.map(async (response) => response.ok ? parseOptions(((await response.json()) as { opt?: string }).opt ?? "") : []))).flat();
    const uniqueCities = Array.from(new Map(cities.map((city) => [city.code, city])).values()).sort((a, b) => a.name.localeCompare(b.name, "id"));
    return NextResponse.json({ data: uniqueCities });
  } catch {
    return NextResponse.json({ data: [], error: "Data kota/kabupaten sedang tidak tersedia" }, { status: 502 });
  }
}
