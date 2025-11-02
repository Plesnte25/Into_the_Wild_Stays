const Properties = require("../models/Properties");

const getProperties = async (req, res) => {
    try {
        const properties = await Properties.find();
        res.status(200).json({ message: "Properties fetched successfully", properties: properties });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await Properties.findById(id);
        res.status(200).json({ message: "Property fetched successfully", property: property });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editProperty = async (req, res) => {
    const { id } = req.params;
    const { name, price, guestCapacity, maximumCapacity } = req.body;
    const property = await Properties.findByIdAndUpdate(id, { name, price, guestCapacity, maximumCapacity });
    res.status(200).json({ message: "Property updated successfully", property: property });
};


const addProperty = async (req, res) => {
    const { name,
        price,
        guestCapacity,
        maximumCapacity,
        images,
        amenities,
        bookingPolicies,
        cancellationPolicies,
        faqs,
        tags,
        location,
        address,
        rating,
        reviews,
        numberOfCottages,
        locationLink,
        description } = req.body;
    const numberguestCapacity = Number(guestCapacity);
    const numbermaximumCapacity = Number(maximumCapacity);
    const numbernumberOfCottages = Number(numberOfCottages);
    const numberrating = Number(rating);
    const numberreviews = Number(reviews);
    const numberprice = Number(price);
    const property = new Properties({
        name,
        price: numberprice,
        guestCapacity: numberguestCapacity,
        maximumCapacity: numbermaximumCapacity,
        images,
        amenities,
        bookingPolicies,
        cancellationPolicies,
        faqs,
        tags,
        location,
        address,
        rating: numberrating,
        reviews: numberreviews,
        bedroom: numbernumberOfCottages,
        locationLink,
        description
    });
    await property.save();
    res.status(200).json({ message: "Property added successfully", property: property });
};


const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        await Properties.findByIdAndDelete(id);
        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    editProperty,
    addProperty,
    deleteProperty
};