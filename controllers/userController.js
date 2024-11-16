import User from "../models/userModel.js";

// Declare a default filter variable
const defaultFilter = { isActive: true };

// Create a new user
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body.data);

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(defaultFilter); // Apply default filter
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const filter = { ...defaultFilter, _id: req.params.id }; // Include default filter with ID
    const user = await User.findOne(filter); // Use `findOne` for combining filters

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};


// Update a user
export const updateUser = async (req, res) => {
  try {
    const { firstname, lastname, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstname, lastname, phone, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete a user. We dont give feature to delete user. It can be used for internal use
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
