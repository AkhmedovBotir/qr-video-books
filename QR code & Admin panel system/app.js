const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const cors = require("cors");
require("dotenv").config();

const webRoutes = require("./routes/web.routes");
const { attachAuthUser } = require("./middlewares/auth.middleware");

const app = express();

app.set("trust proxy", process.env.TRUST_PROXY === "0" ? false : Number(process.env.TRUST_PROXY) || 1);

app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    },
    store: process.env.MONGO_URI
      ? MongoStore.create({
          mongoUrl: process.env.MONGO_URI
        })
      : undefined
  })
);
app.use(attachAuthUser);

app.use("/", webRoutes);

app.use((req, res) => {
  res.status(404).render("errors/404", {
    title: "404 - Sahifa topilmadi"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("errors/500", {
    title: "500 - Server xatosi"
  });
});

module.exports = app;
