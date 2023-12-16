const mongoose = require("mongoose");
const handleMongooseError = require("../helpers/handleMongooseError");

const Schema = mongoose.Schema;

const contactsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contactsSchema.post("save", handleMongooseError);

const Contact = mongoose.model("contact", contactsSchema);

module.exports = Contact;
