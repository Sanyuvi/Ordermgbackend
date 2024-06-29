import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dataBaseConnection } from "./db.js";
import { orderRouter } from "./Routes/order.js";
import { itemRouter } from "./Routes/items.js";

//config dotenv
dotenv.config();
//db connection
dataBaseConnection();
const PORT = process.env.PORT;
//intialize server
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use("/Images", express.static("Images"));

//Routes
app.use("/api/orders", orderRouter);
app.use("/api/items", itemRouter);

//server listening
app.listen(PORT, () => console.log(`Server started in localhost:${PORT} `));
