const readline = require("readline");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

const run = async () => {
  try {
    await connectDB();

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI topilmadi. .env faylini to'g'ri sozlang.");
    }

    const name = await ask("Admin name: ");
    const phone = await ask("Admin phone: ");
    const usernameRaw = await ask("Admin username: ");
    const password = await ask("Admin password: ");

    const username = usernameRaw.toLowerCase();

    if (!name || !phone || !username || !password) {
      throw new Error("Barcha maydonlar to'ldirilishi shart.");
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      throw new Error("Bu username allaqachon mavjud.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await Admin.create({
      name,
      phone,
      username,
      password: hashedPassword
    });

    console.log("Admin muvaffaqiyatli yaratildi.");
  } catch (error) {
    console.error("create-admin xatosi:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    process.exit();
  }
};

run();
