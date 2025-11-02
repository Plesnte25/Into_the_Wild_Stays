const express = require('express');
const { getProperties, getPropertyById,editProperty, addProperty, deleteProperty} = require('../controller/propertiesController');
const router = express.Router();

router
  .route("/")
  .get(getProperties)  // GET list
  .post(addProperty);  // POST create

router
  .route("/:id")
  .get(getPropertyById) // GET one
  .put(editProperty)    // UPDATE
  .delete(deleteProperty);

module.exports = router;
