import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary belum dikonfigurasi." }, { status: 503 });
  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Foto profil wajib dipilih." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Foto profil harus berupa gambar." }, { status: 400 });
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "central-tunasbahasa/profile-photos", resource_type: "image", type: "upload", access_mode: "public", unique_filename: true, overwrite: false }, (error, uploaded) => {
        if (error || !uploaded) reject(error ?? new Error("Upload foto profil gagal."));
        else resolve({ secure_url: uploaded.secure_url });
      });
      stream.end(buffer);
    });
    return NextResponse.json({ secureUrl: result.secure_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload foto profil gagal." }, { status: 502 });
  }
}
