import app from "./app";
import { connectDB } from "./db/connection";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Server error:", err.message);
      process.exit(1);
    }
  }
}

main();
