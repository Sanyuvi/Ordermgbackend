import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dataBaseConnection } from "./db.js";
import { orderRouter } from "./Routes/order.js";

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

//Routes
app.use("/api/orders", orderRouter);

//server listening
app.listen(PORT, () => console.log(`Server started in localhost:${PORT} `));
