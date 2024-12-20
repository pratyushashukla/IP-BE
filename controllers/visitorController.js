import Visitor from "../models/visitorModel.js";
import Inmate from "../models/inmateModel.js";
import Appointment from "../models/appointmentModel.js";

// Declare a default filter variable
const defaultFilter = { isActive: true };

// Add Visitor
export const addVisitor = async (req, res) => {
  const {
    firstname,
    lastname,
    contactNumber,
    address,
    inmateId,
    relationship,
  } = req.body;

  if (!lastname || !contactNumber || !inmateId || !relationship) {
    return res
      .status(400)
      .json({
        message: "Last Name, Contact Number, Inmate ID and relationship are required",
      });
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
      relationship,
    });

    const createdVisitor = await visitor.save();
    res
      .status(201)
      .json({ message: "Visitor added successfully", visitor: createdVisitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// List All Visitors
export const listVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find(defaultFilter) // Apply default filter
      .populate("inmateId", "firstName lastName");
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Visitor by ID
export const getVisitorById = async (req, res) => {
  const { id } = req.params;

  try {
    const visitor = await Visitor.findOne({ ...defaultFilter, _id: id }) // Apply default filter with ID
      .populate("inmateId", "firstName lastName");

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search Visitors by Filter Parameters
export const searchVisitors = async (req, res) => {
  const { name, inmateName, contactNumber } = req.query;

  const filter = { ...defaultFilter }; // Merge default filter

  if (name) {
    filter.$or = [
      { firstname: new RegExp(name, "i") },
      { lastname: new RegExp(name, "i") },
    ];
  }
  if (contactNumber) {
    filter.contactNumber = new RegExp(contactNumber, "i");
  }

  try {
    // Fetch Inmate IDs based on inmateName if provided
    let inmateIds = [];
    if (inmateName) {
      const inmates = await Inmate.find({
        $or: [
          { firstName: new RegExp(inmateName.trim(), "i") },
          { lastName: new RegExp(inmateName.trim(), "i") },
        ],
      });
      inmateIds = inmates.map((inmate) => inmate._id); // Collect IDs of matching inmates
    }

    // Add inmateId filter if inmateName was provided
    if (inmateIds.length > 0) {
      filter.inmateId = { $in: inmateIds };
    } else if (inmateName) {
      // If inmateName was provided but no inmates found, return an empty result
      return res.status(200).json([]);
    }

    // Query visitors with the accumulated filter and populate inmate details
    const visitors = await Visitor.find(filter).populate(
      "inmateId",
      "firstName lastName"
    );
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Update Visitor
export const updateVisitor = async (req, res) => {
  const { firstname, lastname, contactNumber, address, relationship } =
    req.body;

  try {
    const updateData = {};
    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (address !== undefined) updateData.address = address;
    if (relationship !== undefined) updateData.relationship = relationship;

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res
      .status(200)
      .json({
        message: "Visitor updated successfully",
        visitor: updatedVisitor,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Visitor
export const deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the visitor is associated with any appointments
    const appointmentCount = await Appointment.countDocuments({ visitorId: id, isActive: true });

    if (appointmentCount > 0) {
      // Visitor is associated with one or more appointments
      return res.status(400).json({
        message: `This visitor is associated with appointments. Please delete the associated appointments first before deleting the visitor.`
      });
    }

    // Proceed with soft delete of the visitor (mark as inactive)
    const visitor = await Visitor.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

