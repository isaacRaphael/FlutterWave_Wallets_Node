const { Schema, model, default: mongoose } = require("mongoose");

const walletSchema = Schema(
  {
    balance: { type: Number, default: 0 },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = model("wallet", walletSchema);