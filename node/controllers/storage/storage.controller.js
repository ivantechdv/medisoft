const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Middleware para manejar la carpeta de destino
const getStorage = (container) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = path.join("public", container || "uploads");
      // Crear la carpeta si no existe
      fs.mkdirSync(folder, { recursive: true });
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + "-" + crypto.randomBytes(4).toString("hex");
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
};

// Middleware para subir archivos
const upload = (container) => multer({ storage: getStorage(container) });

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = path
    .relative("public", path.join(req.file.destination, req.file.filename))
    .replace(/\\/g, "/"); // Reemplazar '\' por '/'
  res.status(201).json({
    filename: req.file.filename,
    path: filePath,
    url: `${req.protocol}://${req.get("host")}/${filePath}`,
  });
};
// Controlador para eliminar archivos
const deleteFile = (req, res) => {
  const { filename, container } = req.params;
  const folder = path.join("public", container || "uploads");
  const filePath = path.join(folder, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File not found or error deleting file" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  });
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
};
