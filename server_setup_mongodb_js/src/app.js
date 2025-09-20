import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./controllers/user/userRoute.js";
// import { creatorRoute } from "./controllers/creator/creatorRoute.js";
// import { adminRoute } from "./controllers/admin/adminRoute.js";
import projectRoute from "./controllers/project/projectRoutes.js";
import adminRoute from "./controllers/admin/adminRoutes.js";

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000","http://localhost:3001"],
        credentials: true
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRoute);
app.use("/api/projects", projectRoute);
app.use("/api/admin", adminRoute);
// app.use("/api/creators", creatorRoute);
// app.use("/api/admins", adminRoute);

export { app };
