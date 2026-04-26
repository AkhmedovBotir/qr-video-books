const express = require("express");
const { getHomePage } = require("../controllers/home.controller");
const {
  getLoginPage,
  loginAdmin,
  logoutAdmin
} = require("../controllers/auth.controller");
const { getDashboard, getAnalyticsPage } = require("../controllers/admin.controller");
const upload = require("../middlewares/upload.middleware");
const {
  getQrListPage,
  getPublicQrPage,
  createQrItem,
  updateQrItem,
  deleteQrItem,
  openQrFile,
  streamQrFile
} = require("../controllers/qr.controller");
const {
  requireAuth,
  redirectIfAuthenticated
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getHomePage);
router.get("/admin/login", redirectIfAuthenticated, getLoginPage);
router.post("/admin/login", redirectIfAuthenticated, loginAdmin);
router.post("/admin/logout", requireAuth, logoutAdmin);
router.get("/admin/dashboard", requireAuth, getDashboard);
router.get("/admin/analytics", requireAuth, getAnalyticsPage);
router.get("/admin/qr", requireAuth, getQrListPage);
router.post("/admin/qr", requireAuth, upload.single("file"), createQrItem);
router.put("/admin/qr/:id", requireAuth, upload.single("file"), updateQrItem);
router.delete("/admin/qr/:id", requireAuth, deleteQrItem);
router.get("/qr", getPublicQrPage);
router.get("/q/:token", openQrFile);
router.get("/q/:token/stream", streamQrFile);

module.exports = router;
