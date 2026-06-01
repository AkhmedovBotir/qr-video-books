const mongoose = require("mongoose");

const qrItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      immutable: true
    },
    file: {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    scanCount: {
      type: Number,
      default: 0
    },
    scanLogs: {
      type: [Date],
      default: []
    },
    includeInVideoList: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("QrItem", qrItemSchema);
