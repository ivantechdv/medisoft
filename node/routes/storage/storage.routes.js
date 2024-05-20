const express = require("express");
const router = express.Router();
const storageController = require("../../controllers/storage/storage.controller");

router.post("/", (req, res, next) => {
  const container = req.query.container || "uploads";
  const uploadMiddleware = storageController.upload(container).single("file");

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    storageController.uploadFile(req, res);
  });
});

module.exports = router;
