const express = require("express");

const authenticate = require("../../middlewares/authenticate");

const router = express.Router();

const {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts");

router.get("/", authenticate, getContacts);

router.get("/:contactId", getContactById);

router.post("/", createContact);

router.delete("/:contactId", deleteContact);

router.put("/:contactId", updateContact);

router.patch("/:contactId/favorite", updateStatusContact);

module.exports = router;
