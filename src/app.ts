import express from "express";
import emailRoutes from "./routes/email.routes";
import privacyChangerRoutes from "./routes/privacy.changer.routes";
import projectRoutes from "./routes/projects.routes";
import permissionRoutes from "./routes/permission.routes";
import projectViewRoutes from "./routes/projectview.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import authRoutes from "./routes/auth.routes";
import supabaseRoutes from "./routes/supabase.routes";
import paymongoRoutes from "./routes/paymongo.routes";
import { requestLogger } from "./middlewares/logger.middleware";
import cors from "cors";
const app = express();
const port = 5000;

const allowedOrigins = [
  process.env.LOCAL_FRONTEND_URL,
  process.env.PROD_FRONTEND_URL,
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://buildx-designer.vercel.app",
  "https://build-x-designer-api.vercel.app",
  "https://buildxdesigner.vercel.app",
  "https://fork-buildxdesigner.vercel.app",
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (/^https?:\/\/[^.]+\.buildxdesigner\.site$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.use("/api", emailRoutes);
app.use("/api", privacyChangerRoutes);
app.use("/api", projectRoutes);
app.use("/api", permissionRoutes);
app.use("/api", projectViewRoutes);
app.use("/api", onboardingRoutes);
app.use("/api", authRoutes);
app.use("/api", supabaseRoutes);
app.use("/api", paymongoRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "v2.0.2-final-fix",
    message: "Backend is updated and supporting anonymous checkout",
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Builder API Server is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use((req, res) => {
  console.log(
    `[404 MATCH FAILURE] Method: ${req.method} URL: ${req.originalUrl || req.url}`
  );
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl || req.url} (Logged on server)`,
    suggestion: "Check if the API path is correctly prefixed with /api",
  });
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
