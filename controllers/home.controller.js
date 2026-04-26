const getHomePage = (req, res) => {
  if (req.session?.adminId) {
    return res.redirect("/admin/dashboard");
  }

  return res.redirect("/admin/login");
};

module.exports = {
  getHomePage
};
