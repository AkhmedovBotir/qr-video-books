const express = require("express");
const { getHomePage, getVideoBooksPage } = require("../controllers/home.controller");
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
  getVideoListApi,
  updateVideoListSelection,
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
const {
  getStandaloneQrPage,
  getStandaloneQrListApi,
  createStandaloneQrApi,
  deleteStandaloneQrApi
} = require("../controllers/standalone-qr.controller");

const router = express.Router();

router.get("/", getHomePage);
router.get("/video.video-books.uz", getVideoBooksPage);
router.get("/admin/login", redirectIfAuthenticated, getLoginPage);
router.post("/admin/login", redirectIfAuthenticated, loginAdmin);
router.post("/admin/logout", requireAuth, logoutAdmin);
router.get("/admin/dashboard", requireAuth, getDashboard);
router.get("/admin/analytics", requireAuth, getAnalyticsPage);
router.get("/admin/standalone-qr", requireAuth, getStandaloneQrPage);
router.get("/admin/qr", requireAuth, getQrListPage);
router.post("/admin/qr/video-list-selection", requireAuth, updateVideoListSelection);
router.post("/admin/qr", requireAuth, upload.single("file"), createQrItem);
router.put("/admin/qr/:id", requireAuth, upload.single("file"), updateQrItem);
router.delete("/admin/qr/:id", requireAuth, deleteQrItem);
router.get("/api/videos", getVideoListApi);
router.get("/api/standalone-qr", requireAuth, getStandaloneQrListApi);
router.post("/api/standalone-qr", requireAuth, createStandaloneQrApi);
router.delete("/api/standalone-qr/:id", requireAuth, deleteStandaloneQrApi);
router.get("/qr", getPublicQrPage);
router.get("/q/:token", openQrFile);
router.get("/q/:token/stream", streamQrFile);

module.exports = router;
