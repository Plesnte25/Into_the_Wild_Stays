const User = require('../models/User');

// Fields a user (or admin) is allowed to change via the profile-edit
// endpoint. Excludes role/isVerified/otp/password/username so a caller can't
// use this endpoint for privilege escalation or auth-bypass (mass
// assignment) — those have dedicated, more carefully-guarded flows.
const EDITABLE_FIELDS = ['name', 'email', 'phone', 'gender', 'avatar'];

// Edit user profile
exports.editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = {};
        for (const field of EDITABLE_FIELDS) {
            if (req.body[field] !== undefined) {
                updatedData[field] = req.body[field];
            }
        }
        // Only an admin may change another user's role.
        if (req.body.role !== undefined && req.user && req.user.role === 'admin') {
            updatedData.role = req.body.role;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', userId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
