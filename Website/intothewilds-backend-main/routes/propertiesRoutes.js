const express = require('express');
const { getProperties, getPropertyById,editProperty, addProperty, deleteProperty} = require('../controller/propertiesController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

router
  .route("/")
  .get(getProperties)  // GET list (public)
  .post(authenticateToken, authorizeRole("admin"), addProperty);  // POST create (admin only)

router
  .route("/:id")
  .get(getPropertyById) // GET one (public)
  .put(authenticateToken, authorizeRole("admin"), editProperty)    // UPDATE (admin only)
  .delete(authenticateToken, authorizeRole("admin"), deleteProperty); // DELETE (admin only)

module.exports = router;
