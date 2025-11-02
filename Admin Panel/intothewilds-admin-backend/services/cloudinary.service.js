import { v2 as cloudinary } from "cloudinary";

export function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_NAME || "";
  const apiKey = process.env.CLOUDINARY_KEY || "";
  const apiSecret = process.env.CLOUDINARY_SECRET || "";

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const ok = Boolean(cloudName && apiKey && apiSecret);
  // Safe debug (no secrets)
  console.log(
    `[Cloudinary] config: cloud=${cloudName || "<empty>"} key=${
      apiKey ? apiKey.slice(0, 4) + "…" : "<empty>"
    } ok=${ok}`
  );
  return ok;
}

function assertConfigured() {
  const cfg = cloudinary.config();
  const missing = [];
  if (!cfg.cloud_name) missing.push("CLOUDINARY_NAME");
  if (!cfg.api_key) missing.push("CLOUDINARY_KEY");
  if (!cfg.api_secret) missing.push("CLOUDINARY_SECRET");
  if (missing.length) {
    throw new Error(`Cloudinary not configured: set ${missing.join(", ")}`);
  }
}

export function toThumb(url, { w = 420, h = 280, q = "auto:eco" } = {}) {
  if (!url || !/^https?:\/\/res\.cloudinary\.com/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_${q},c_fill,w_${w},h_${h}/`);
}

export async function getCloudinaryStatsSafely() {
  try {
    assertConfigured();
    const usage = await cloudinary.api.usage();

    const totalImages =
      usage?.resources?.image?.used ??
      usage?.resources?.usage?.image?.used ??
      0;

    const totalStorageBytes =
      usage?.storage?.usage?.total_usage ?? usage?.storage?.usage ?? 0;

    const bandwidthBytes =
      usage?.bandwidth?.usage?.total_usage ?? usage?.bandwidth?.usage ?? 0;

    return { ok: true, totalImages, totalStorageBytes, bandwidthBytes };
  } catch (e) {
    return {
      ok: false,
      totalImages: 0,
      totalStorageBytes: 0,
      bandwidthBytes: 0,
      error: e?.message || "Unknown Cloudinary error",
    };
  }
}

export async function uploadLogoBuffer(
  buffer,
  {
    folder = process.env.CLOUDINARY_FOLDER || "itw/uploads",
    publicId = "site-logo",
  } = {}
) {
  assertConfigured();
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('uploadLogoBuffer: "buffer" must be a Buffer');
  }
  const res = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          use_filename: false,
          unique_filename: false,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      )
      .end(buffer);
  });
  return {
    publicId: res.public_id,
    url: res.secure_url,
    bytes: res.bytes,
    width: res.width ?? null,
    height: res.height ?? null,
    format: res.format ?? null,
  };
}

export async function uploadBuffer(
  buffer,
  {
    folder = process.env.CLOUDINARY_FOLDER || "itw/uploads",
    originalname,
    resourceType = "auto",
    publicId,
  } = {}
) {
  assertConfigured();
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('uploadBuffer: "buffer" must be a Buffer');
  }
  const options = {
    folder,
    resource_type: resourceType,
    use_filename: !!originalname,
    unique_filename: !publicId,
    overwrite: false,
  };
  if (publicId) options.public_id = publicId;

  const res = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });
  return {
    publicId: res.public_id,
    url: res.secure_url,
    bytes: res.bytes,
    width: res.width ?? null,
    height: res.height ?? null,
    format: res.format ?? null,
  };
}

export async function deleteByPublicId(publicId, resourceType = "image") {
  assertConfigured();
  if (!publicId) throw new Error('deleteByPublicId: "publicId" is required');
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return res?.result === "ok" ? "ok" : "not_found";
  } catch (err) {
    console.warn("Cloudinary destroy error:", err?.message || err);
    return "not_found";
  }
}

export function buildSignedParams(params = {}) {
  assertConfigured();
  const cfg = cloudinary.config();

  const timestamp = params.timestamp || Math.floor(Date.now() / 1000);
  const unsigned = {
    timestamp,
    folder: params.folder || process.env.CLOUDINARY_FOLDER || "itw/uploads",
    public_id: params.public_id,
    eager: params.eager,
    resource_type: params.resource_type || "auto",
    overwrite: params.overwrite === true ? true : undefined,
    invalidate: params.invalidate === true ? true : undefined,
  };

  const payload = Object.fromEntries(
    Object.entries(unsigned).filter(([, v]) => v !== undefined)
  );
  const signature = cloudinary.utils.api_sign_request(payload, cfg.api_secret);

  return {
    cloudName: cfg.cloud_name,
    apiKey: cfg.api_key,
    timestamp,
    signature,
    params: unsigned,
  };
}
