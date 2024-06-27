import express from "express";
import multer from "multer";
import { Item } from "../models/item.js";
import fs from 'fs';
import sharp from "sharp";


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
    limits: {
      fileSize: 2000000
       // 2000000 Bytes = 1 MB
    }   
})

//upload item
router.post("/createitem",Upload.single('image'),async(req,res)=>{
    const { itemName, category, price } = req.body;
       // Ensure req.file exists and is an image file 
       if (!req.file || !req.file.path) {
        return res.status(400).json({ error: "No image uploaded" });
    }
    try {
        // Generate thumbnail using Sharp
        const thumbnailFilename = `thumbnail_${req.file.filename}`;
        const thumbnailPath = `Images/${thumbnailFilename}`;        
        await sharp(req.file.path)
            .resize({width:35, height:35}) 
            .toFile(thumbnailPath);
    const newItem = new Item({
      itemName,
      category,
      price,
      image: req.file.filename,
      thumbnail: thumbnailFilename,
    });
  
   // Save new item to database
   const savedItem = await newItem.save();

   // Respond with saved item data
   res.status(201).json(savedItem);
  }
      catch(err) {
        console.error("Error creating item:", err);
        res.status(400).json({ message: err.message });
      };
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
});
//edit item
router.put("/edititem/:id", Upload.single('image'), async (req, res) => {
  const itemId = req.params.id;
  const { itemName, category, price } = req.body;

  try {
      // Find the item by ID
      const item = await Item.findById(itemId);
      if (!item) {
          return res.status(404).json({ error: "Item not found" });
      }

      // Update item fields if provided
      if(itemName) item.itemName = itemName;
      if(category) item.category = category;
      if(price) item.price = price;

      // Handle image update if a new image is uploaded
      if (req.file) {
          // Generate thumbnail for new image using Sharp
          const thumbnailFilename = `thumbnail_${req.file.filename}`;
          const thumbnailPath = `Images/${thumbnailFilename}`;
          await sharp(req.file.path)
              .resize({ width: 35, height: 35 })
              .toFile(thumbnailPath);

          // Delete existing image and thumbnail files if they exist
          if (item.image) {
              const imagePath = `Images/${item.image}`;
              try {
                  if (fs.existsSync(imagePath)) {
                      fs.unlinkSync(imagePath);
                      console.log(`Deleted image file: ${imagePath}`);
                  } else {
                      console.log(`Image file not found: ${imagePath}`);
                  }
              } catch (err) {
                  console.error(`Error deleting file ${imagePath}:`, err);
              }
          }

          if (item.thumbnail) {
              const thumbnailPath = `Images/${item.thumbnail}`;
              try {
                  if (fs.existsSync(thumbnailPath)) {
                      fs.unlinkSync(thumbnailPath);
                      console.log(`Deleted thumbnail file: ${thumbnailPath}`);
                  } else {
                      console.log(`Thumbnail file not found: ${thumbnailPath}`);
                  }
              } catch (err) {
                  console.error(`Error deleting file ${thumbnailPath}:`, err);
              }
          }

          // Update item with new image details
          item.image = req.file.filename;
          item.thumbnail = thumbnailFilename;
      }

      // Save updated item to database
      const updatedItem = await item.save();
      res.status(200).json(updatedItem);
  } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Internal server error" });
  } finally {
      // Clean up: Delete temporary uploaded file if new image was uploaded
      if (req.file) {
          try {
              fs.unlinkSync(req.file.path);
          } catch (err) {
              console.error(`Error deleting temporary file ${req.file.path}:`, err);
          }
      }
  }
});

//delete item
router.delete("/deleteitem/:id",async(req,res)=>{
  const id = req.params.id;
    try {
        const item = await Item.findById(id)
;
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete image file
        if (item.image) {
            const imagePath = 'Images'+"/"+ item.image;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        if (item.thumbnail) {
            const thumbnailPath = 'Images'+"/"+ item.thumbnail;
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }

        // Delete user from the database
        await Item.findByIdAndDelete(id)
;
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

export const itemRouter = router;