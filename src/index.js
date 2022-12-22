import express from "express";
import usersRoutes from "./routes/users.routes.js"
import linksRoutes from "./routes/links.routes.js"
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());
app.use(usersRoutes);
app.use(linksRoutes)

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running in port: ${port}`));

