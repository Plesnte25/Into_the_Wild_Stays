import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  // accept images only
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image uploads are allowed."));
};

const limits = { fileSize: 8 * 1024 * 1024, files: 10 }; // 8MB, up to 10

const upload = multer({ storage, fileFilter, limits });
export default upload;
