const getHomePage = (req, res) => {
  const hostname = String(req.hostname || "").toLowerCase();
  if (hostname === "video.video-books.uz" || hostname.endsWith(".video.video-books.uz")) {
    return res.render("pages/public/video-books", {
      layout: false,
      title: "Video Books"
    });
  }

  if (req.session?.adminId) {
    return res.redirect("/admin/dashboard");
  }

  return res.redirect("/admin/login");
};

const getVideoBooksPage = (req, res) => {
  return res.render("pages/public/video-books", {
    layout: false,
    title: "Video Books"
  });
};

module.exports = {
  getHomePage,
  getVideoBooksPage
};
