import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      unique: true, // This is consider as unique for all visitor
      maxlength: 15,
    },
    address: {
      type: String,
    },
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inmate',
      required: true,
    },
    relationship: {
        type: String,
    },
  },
  {
    timestamps: true, 
  }
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;