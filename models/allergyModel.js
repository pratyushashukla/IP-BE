import mongoose from "mongoose";

const allergySchema = new mongoose.Schema(
  {
    allergyName: {
      // can be gluten allegic, dairy allergic, etc
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true, // Defaults to true, will be set to false on delete
    },
  },
  {
    timestamps: true,
  }
);

const Allergy = mongoose.model("Allergy", allergySchema);

export default Allergy;
