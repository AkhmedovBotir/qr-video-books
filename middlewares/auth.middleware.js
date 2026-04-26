const Admin = require("../models/Admin");

const attachAuthUser = async (req, res, next) => {
  const adminId = req.session?.adminId;

  if (!adminId) {
    res.locals.isAuthenticated = false;
    res.locals.currentAdmin = null;
    return next();
  }

  try {
    const admin = await Admin.findById(adminId).select("name phone username");
    if (!admin) {
      req.session.destroy(() => {});
      res.locals.isAuthenticated = false;
      res.locals.currentAdmin = null;
      return next();
    }

    res.locals.isAuthenticated = true;
    res.locals.currentAdmin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.session?.adminId) {
    return res.redirect("/admin/login");
  }
  return next();
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.adminId) {
    return res.redirect("/admin/dashboard");
  }
  return next();
};

module.exports = {
  attachAuthUser,
  requireAuth,
  redirectIfAuthenticated
};
