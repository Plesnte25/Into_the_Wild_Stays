const router = require('express').Router();
const reviewController = require('../controller/reviewController.js');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get latest 10 reviews
router.get('/latest', reviewController.getLatestReviews);

// Get all reviews for a specific property
router.get('/property/:id', reviewController.getReviewsByProperty);

// ✅ Get review by booking ID
router.get('/booking/:id', reviewController.getReviewByBooking);

// Get review by its own ID
router.get('/review/:id', reviewController.getReviewById);

// Create a review — must be a logged-in user.
router.post('/', authenticateToken, reviewController.createReview);

// Update / delete a review — moderation actions, admin only (no
// ownership-tracking exists yet to safely allow "review author only").
router.put('/:id', authenticateToken, authorizeRole('admin'), reviewController.updateReview);
router.delete('/:id', authenticateToken, authorizeRole('admin'), reviewController.deleteReview);

module.exports = router;
