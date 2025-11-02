const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Edit user profile
exports.editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("dw",userId);
        const user = await User.findById(userId);;
        console.log("jb");
        console.log(user);
        if (user) {
            res.status(200).json(user);
        } else { 
            res.status(404).json({ message: 'User not found' });
        }
    }catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }};


exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully', userId });
};
