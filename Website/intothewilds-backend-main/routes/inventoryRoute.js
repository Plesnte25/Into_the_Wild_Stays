const router = require("express").Router();
const inventoryController = require("../controller/inventoryController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { checkAvailability } = require("../controller/inventoryController");

router.post(
  "/create-room",
  authenticateToken,
  authorizeRole("admin"),
  inventoryController.createRoom
);
router.get("/get-inventory", inventoryController.getInventory);
router.get("/availability", checkAvailability);
router.put(
  "/update-room/:roomId",
  authenticateToken,
  authorizeRole("admin"),
  inventoryController.updateRoom
);
router.delete(
  "/remove-room/:roomId",
  authenticateToken,
  authorizeRole("admin"),
  inventoryController.removeRoom
);
module.exports = router;
