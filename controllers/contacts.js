const Contact = require("../models/contacts");
const { contactSchema } = require("../shemas/contactsShemas");
const httpError = require("../helpers/httpError");
const ctrlWrap = require("../helpers/ctrlWrap");

const getContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  const filter = { owner };
  if (favorite !== undefined) {
    filter.favorite = favorite;
  }
  const data = await Contact.find(filter, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email subscription");
  res.status(200).json(data);
};

const getContactById = async (req, res, next) => {
  const contactId = req.params.contactId;
  const data = await Contact.findById(contactId);
  if (data) {
    res.status(200).json(data);
  } else {
    throw httpError(404, `id ${contactId} Not found`);
  }
};

const createContact = async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact);
};

const deleteContact = async (req, res, next) => {
  const contactId = req.params.contactId;
  const data = await Contact.findOneAndDelete({ _id: contactId });
  if (data) {
    res.status(200).json({ message: "Contact deleted" });
  } else {
    throw httpError(404, `id ${contactId} Not found`);
  }
};

const updateContact = async (req, res, next) => {
  const contactId = req.params.contactId;
  const { name, email, phone } = req.body;
  const { error } = contactSchema.validate({ name, email, phone });
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    { name, email, phone },
    { new: true }
  );
  if (updatedContact) {
    res.status(200).json(updatedContact);
  } else {
    throw httpError(404, `id ${contactId} Not found`);
  }
};

const updateStatusContact = async (req, res, next) => {
  const contactId = req.params.contactId;
  const updatedFavorite = req.body.favorite;
  if (updatedFavorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    { favorite: updatedFavorite },
    { new: true }
  );
  if (updatedContact) {
    return res.status(200).json(updatedContact);
  } else {
    throw httpError(404, `id ${contactId} Not found`);
  }
};

module.exports = {
  getContacts: ctrlWrap(getContacts),
  getContactById: ctrlWrap(getContactById),
  createContact: ctrlWrap(createContact),
  deleteContact: ctrlWrap(deleteContact),
  updateContact: ctrlWrap(updateContact),
  updateStatusContact: ctrlWrap(updateStatusContact),
};
