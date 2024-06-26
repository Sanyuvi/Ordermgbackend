import express from "express";
import multer from "multer";
import { Item } from "../models/item.js";


const router = express.Router();

// Image upload

const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: (req, file, cb) => {
        cb(null, "Images")
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
      },
});

const Upload = multer({
    storage: imageStorage,
//     limits: {
//       fileSize: 1000000 // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) { 
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
})

//upload item
router.post("/createitem",Upload.single('image'),(req,res)=>{
    const { itemName, category, price } = req.body;
    const newItem = new Item({
      itemName,
      category,
      price,
      image: req.file.filename,
    });
  
    newItem.save() // save() returns a promise
      .then(savedItem => {
        res.status(201).json(savedItem);
      })
      .catch(err => {
        res.status(400).json({ message: err.message });
      });
})





//get all items
router.get("/",async(req,res)=>{
    try {
        const items= await Item.find()
        res.status(200).json(items)
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// get specific id
router.get("/:id",async(req,res)=>{
   try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    if(!item){
        return res.status(404).json({error:"Item not found"})
    }
    res.status(200).json(item)
   } catch (error) {
    res.status(500).json({error:"Internal serve error"})
   }
})
//edit item


//delete item
router.delete("/deleteitem/:id",async(req,res)=>{
    try {
        const itemId = req.params.id;
        const deleteItem = await Item.findByIdAndDelete(itemId);
        if(!deleteItem){
            return res.status(404).json({error:"Item not found"})
        }
         // Delete image file from the file system
    const imagePath = `/Images/${deleteItem.image}`; // Adjust the path as per your setup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({ message: "Item and associated image deleted successfully" });
    } catch (error) {
        res.status(500).json({error:"Internal server error"})
    }
})


export const itemRouter = router;