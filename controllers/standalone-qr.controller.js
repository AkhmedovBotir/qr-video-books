const QRCode = require("qrcode");
const StandaloneQr = require("../models/StandaloneQr");

const isValidHttpUrl = (value = "") => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const buildQrPayload = async (item) => {
  const qrImage = await QRCode.toDataURL(item.url, { width: 1000, margin: 1 });
  return {
    id: item._id,
    name: item.name,
    url: item.url,
    qrImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

const getStandaloneQrPage = async (req, res, next) => {
  try {
    const items = await StandaloneQr.find({ createdBy: req.session.adminId }).sort({ createdAt: -1 });
    const rows = await Promise.all(items.map((item) => buildQrPayload(item)));

    return res.render("pages/admin/standalone-qr/index", {
      title: "Alohida QR yaratish",
      items: rows
    });
  } catch (error) {
    return next(error);
  }
};

const getStandaloneQrListApi = async (req, res, next) => {
  try {
    const items = await StandaloneQr.find({ createdBy: req.session.adminId }).sort({ createdAt: -1 });
    const data = await Promise.all(items.map((item) => buildQrPayload(item)));

    return res.json({
      success: true,
      count: data.length,
      items: data
    });
  } catch (error) {
    return next(error);
  }
};

const createStandaloneQrApi = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const url = (req.body.url || "").trim();

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "name va url majburiy."
      });
    }

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        success: false,
        message: "url faqat http yoki https bo'lishi kerak."
      });
    }

    const item = await StandaloneQr.create({
      name,
      url,
      createdBy: req.session.adminId
    });

    const payload = await buildQrPayload(item);

    return res.status(201).json({
      success: true,
      item: payload
    });
  } catch (error) {
    return next(error);
  }
};

const deleteStandaloneQrApi = async (req, res, next) => {
  try {
    const item = await StandaloneQr.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.adminId
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "QR topilmadi."
      });
    }

    return res.json({
      success: true
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStandaloneQrPage,
  getStandaloneQrListApi,
  createStandaloneQrApi,
  deleteStandaloneQrApi
};
