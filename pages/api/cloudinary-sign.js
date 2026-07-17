import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { folder } = req.body;
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const toSign = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  res.status(200).json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
