import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER ?? "central-tunasbahasa/payment-proofs";

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET." }, { status: 503 });
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File bukti pembayaran wajib dipilih." }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type === "application/pdf" ? "raw" : "image";
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, type: "upload", access_mode: "public", unique_filename: true, overwrite: false },
        (error, uploaded) => {
          if (error || !uploaded) reject(error ?? new Error("Upload ke Cloudinary gagal."));
          else resolve({ secure_url: uploaded.secure_url, public_id: uploaded.public_id });
        },
      );
      stream.end(buffer);
    });
    return NextResponse.json({ secureUrl: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload ke Cloudinary gagal." }, { status: 502 });
  }
}
