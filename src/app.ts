import express from "express";
import emailRoutes from "./routes/email.routes";
import privacyChangerRoutes from "./routes/privacy.changer.routes";
import projectRoutes from "./routes/projects.routes";
import permissionRoutes from "./routes/permission.routes";
import projectViewRoutes from "./routes/projectview.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import cors from "cors";
const app = express();
const port = 5000;
app.use(cors());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://buildx-designer.vercel.app",
    "https://build-x-designer-api.vercel.app",
    "https://buildxdesigner.vercel.app",
    "https://fork-buildxdesigner.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", emailRoutes);
app.use("/api", privacyChangerRoutes);
app.use("/api", projectRoutes);
app.use("/api", permissionRoutes);
app.use("/api", projectViewRoutes);
app.use("/api", onboardingRoutes);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
