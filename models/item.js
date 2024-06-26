import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    itemName: String,
    category: String,
    price: Number,
    image: String, 
    thumbnail:String   
  });
  
  const Item = mongoose.model("item", itemSchema);
  export { Item };