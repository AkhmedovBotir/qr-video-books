const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");
const crypto = require("crypto");
const QRCode = require("qrcode");
const QrItem = require("../models/QrItem");

const getAppUrl = (req) => process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
const getQrLink = (req, token) => `${getAppUrl(req)}/q/${token}`;
const getUploadFilePath = (filename) => path.join(__dirname, "..", "uploads", "qr", filename);

const removeFileIfExists = async (filename) => {
  if (!filename) return;
  const filePath = getUploadFilePath(filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Faylni o'chirishda xato:", filePath, error.message);
      throw error;
    }
  }
};

const buildCreatedAtRange = (startDateText, endDateText) => {
  if (!startDateText && !endDateText) return null;

  const range = {};
  if (startDateText) {
    const start = new Date(`${startDateText}T00:00:00.000Z`);
    if (!Number.isNaN(start.getTime())) range.$gte = start;
  }
  if (endDateText) {
    const end = new Date(`${endDateText}T23:59:59.999Z`);
    if (!Number.isNaN(end.getTime())) range.$lte = end;
  }

  return Object.keys(range).length ? range : null;
};

const buildQrCard = async (req, item) => {
  const qrLink = getQrLink(req, item.qrToken);
  const qrImage = await QRCode.toDataURL(qrLink, { width: 1000, margin: 1 });

  return {
    ...item.toObject(),
    qrLink,
    qrImage
  };
};

const getQrListPage = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const startDate = (req.query.startDate || "").trim();
    const endDate = (req.query.endDate || "").trim();

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const createdAtRange = buildCreatedAtRange(startDate, endDate);
    if (createdAtRange) {
      query.createdAt = createdAtRange;
    }

    const items = await QrItem.find(query).sort({ createdAt: -1 });
    const cards = await Promise.all(items.map((item) => buildQrCard(req, item)));

    res.render("pages/admin/qr/index", {
      title: "QR Ro'yxati",
      items: cards,
      filters: {
        search,
        startDate,
        endDate
      },
      ui: {
        modal: req.query.modal || "",
        error: req.query.error || "",
        createName: req.query.createName || "",
        editName: req.query.editName || "",
        editId: req.query.editId || ""
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublicQrPage = async (req, res, next) => {
  try {
    const items = await QrItem.find().sort({ createdAt: -1 });
    const cards = await Promise.all(items.map((item) => buildQrCard(req, item)));

    res.render("pages/public/qr-list", {
      layout: false,
      title: "Ommaviy QR sahifa",
      items: cards
    });
  } catch (error) {
    next(error);
  }
};

const createQrItem = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();

    if (!name || !req.file) {
      if (req.file) {
        await removeFileIfExists(req.file.filename);
      }
      return res.redirect(`/admin/qr?modal=create&error=${encodeURIComponent("Nom va fayl majburiy.")}&createName=${encodeURIComponent(name)}`);
    }

    try {
      await QrItem.create({
        name,
        qrToken: crypto.randomBytes(16).toString("hex"),
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype || "application/octet-stream",
          size: req.file.size || 0
        },
        createdBy: req.session.adminId
      });
    } catch (dbError) {
      await removeFileIfExists(req.file.filename);
      throw dbError;
    }

    return res.redirect("/admin/qr");
  } catch (error) {
    return next(error);
  }
};

const updateQrItem = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const item = await QrItem.findById(req.params.id);

    if (!item) {
      if (req.file) {
        await removeFileIfExists(req.file.filename);
      }
      return res.status(404).render("errors/404", { title: "QR topilmadi" });
    }

    if (!name) {
      if (req.file) {
        await removeFileIfExists(req.file.filename);
      }
      return res.redirect(
        `/admin/qr?modal=edit&editId=${item._id}&error=${encodeURIComponent("Nom majburiy.")}&editName=${encodeURIComponent(name)}`
      );
    }

    item.name = name;

    if (req.file) {
      const oldFilename = item.file.filename;
      item.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype || "application/octet-stream",
        size: req.file.size || 0
      };
      await removeFileIfExists(oldFilename);
    }

    await item.save();
    return res.redirect("/admin/qr");
  } catch (error) {
    return next(error);
  }
};

const deleteQrItem = async (req, res, next) => {
  try {
    const item = await QrItem.findById(req.params.id);
    if (!item) {
      return res.redirect("/admin/qr");
    }

    await removeFileIfExists(item.file.filename);
    await item.deleteOne();

    return res.redirect("/admin/qr");
  } catch (error) {
    return next(error);
  }
};

const openQrFile = async (req, res, next) => {
  try {
    const item = await QrItem.findOneAndUpdate(
      { qrToken: req.params.token },
      {
        $inc: { scanCount: 1 },
        $push: { scanLogs: new Date() }
      },
      { new: true }
    );
    if (!item) {
      return res.status(404).render("errors/404", { title: "QR topilmadi" });
    }

    return res.render("pages/public/qr-player", {
      layout: false,
      title: item.name,
      item
    });
  } catch (error) {
    return next(error);
  }
};

const streamQrFile = async (req, res, next) => {
  try {
    const item = await QrItem.findOne({ qrToken: req.params.token });
    if (!item) {
      return res.status(404).render("errors/404", { title: "QR topilmadi" });
    }

    const filePath = path.join(__dirname, "..", "uploads", "qr", item.file.filename);
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;
    const contentType = item.file.mimeType || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");

    if (!range) {
      res.setHeader("Content-Length", fileSize);
      fsSync.createReadStream(filePath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(parts[0], 10);
    const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start >= fileSize || end >= fileSize) {
      res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
      return res.end();
    }

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", end - start + 1);

    fsSync
      .createReadStream(filePath, { start, end })
      .on("error", (streamError) => next(streamError))
      .pipe(res);
    return;
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getQrListPage,
  getPublicQrPage,
  createQrItem,
  updateQrItem,
  deleteQrItem,
  openQrFile,
  streamQrFile
};
