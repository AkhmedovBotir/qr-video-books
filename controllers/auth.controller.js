const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const getLoginPage = (req, res) => {
  res.render("pages/admin/login", {
    title: "Admin Login",
    errorMessage: null,
    formData: {
      username: ""
    }
  });
};

const loginAdmin = async (req, res, next) => {
  try {
    const username = (req.body.username || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!username || !password) {
      return res.status(400).render("pages/admin/login", {
        title: "Admin Login",
        errorMessage: "Username va password majburiy.",
        formData: { username }
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).render("pages/admin/login", {
        title: "Admin Login",
        errorMessage: "Login ma'lumotlari noto'g'ri.",
        formData: { username }
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).render("pages/admin/login", {
        title: "Admin Login",
        errorMessage: "Login ma'lumotlari noto'g'ri.",
        formData: { username }
      });
    }

    req.session.adminId = admin._id.toString();
    return res.redirect("/admin/dashboard");
  } catch (error) {
    return next(error);
  }
};

const logoutAdmin = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

module.exports = {
  getLoginPage,
  loginAdmin,
  logoutAdmin
};
