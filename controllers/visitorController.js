import mongoose from 'mongoose';
import Visitor from '../models/visitorModel.js';
import Inmate from '../models/inmateModel.js';

// Add Visitor
export const addVisitor = async (req, res) => {
  const { firstname, lastname, contactNumber, address, inmateId, relationship } = req.body;

  if (!lastname || !contactNumber || !inmateId) {
    return res.status(400).json({ message: "Last Name, Contact Number, and Inmate ID are required" });
  }

  try {
    const inmateExists = await Inmate.findById(inmateId);
    if (!inmateExists) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    const visitor = new Visitor({
      firstname,
      lastname,
      contactNumber,
      address,
      inmateId,
      relationship
    });

    const createdVisitor = await visitor.save();
    res.status(201).json({ message: "Visitor added successfully", visitor: createdVisitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// List All Visitors
export const listVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate("inmateId", "firstName lastName");
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Visitor by ID
export const getVisitorById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const visitor = await Visitor.findById(id).populate("inmateId", "firstName lastName");
  
      if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
      }
  
      res.status(200).json(visitor);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  

// Update Visitor
export const updateVisitor = async (req, res) => {
  const { firstname, lastname, contactNumber, address, relationship } = req.body;

  try {
    const updateData = {};
    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (address !== undefined) updateData.address = address;
    if (relationship !== undefined) updateData.relationship = relationship;

    const updatedVisitor = await Visitor.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor updated successfully", visitor: updatedVisitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Visitor
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


