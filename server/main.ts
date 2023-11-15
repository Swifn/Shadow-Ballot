import express from "express";
import { Config } from "./configs/config.js";
import { authRouter } from "./routes/auth.route.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  next();
});

app.use("/auth", authRouter);
app.listen(0, function () {
  const serverAddress = this.address();

  if (serverAddress && typeof serverAddress === "object") {
    console.log(`Server is running on port ${serverAddress.port}`);
  } else {
    console.log("Server is running, but the port is unknown");
  }
});
