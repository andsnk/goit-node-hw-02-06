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

router.get("/:contactId", authenticate, getContactById);

router.post("/", authenticate, createContact);

router.delete("/:contactId", authenticate, deleteContact);

router.put("/:contactId", authenticate, updateContact);

router.patch("/:contactId/favorite", authenticate, updateStatusContact);

module.exports = router;
