const QrItem = require("../models/QrItem");

const buildScanDateRange = (startDateText, endDateText) => {
  if (!startDateText && !endDateText) return null;

  const range = {};
  if (startDateText) {
    const start = new Date(`${startDateText}T00:00:00.000Z`);
    if (!Number.isNaN(start.getTime())) range.start = start;
  }
  if (endDateText) {
    const end = new Date(`${endDateText}T23:59:59.999Z`);
    if (!Number.isNaN(end.getTime())) range.end = end;
  }

  return Object.keys(range).length ? range : null;
};

const isInRange = (dateValue, range) => {
  if (!range) return true;
  if (range.start && dateValue < range.start) return false;
  if (range.end && dateValue > range.end) return false;
  return true;
};

const getDashboard = async (req, res, next) => {
  try {
    const qrCount = await QrItem.countDocuments();
    res.render("pages/admin/dashboard", {
      title: "Admin Dashboard",
      qrCount
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsPage = async (req, res, next) => {
  try {
    const startDate = (req.query.startDate || "").trim();
    const endDate = (req.query.endDate || "").trim();
    const range = buildScanDateRange(startDate, endDate);

    const items = await QrItem.find().select("name scanCount scanLogs createdAt").lean();
    const rows = items.map((item) => {
      const logs = Array.isArray(item.scanLogs) ? item.scanLogs : [];
      const filteredScans = logs.filter((scanAt) => isInRange(new Date(scanAt), range)).length;
      return {
        id: item._id.toString(),
        name: item.name,
        createdAt: item.createdAt,
        totalScanCount: item.scanCount || logs.length,
        filteredScanCount: filteredScans
      };
    });

    const totalScans = rows.reduce((sum, row) => sum + row.filteredScanCount, 0);
    const sortedRows = [...rows].sort((a, b) => b.filteredScanCount - a.filteredScanCount);
    const topScanned = sortedRows[0] || null;

    res.render("pages/admin/analytics", {
      title: "Analitika",
      filters: { startDate, endDate },
      totalScans,
      topScanned,
      rows: sortedRows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAnalyticsPage
};
