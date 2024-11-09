import mongoose from "mongoose";

const allergySchema = new mongoose.Schema(
  {
    allergyName: { // can be gluten allegic, dairy allergic, etc
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Allergy = mongoose.model("Allergy", allergySchema);

export default Allergy;
