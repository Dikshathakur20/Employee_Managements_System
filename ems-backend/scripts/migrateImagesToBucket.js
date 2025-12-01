// migrateBase64ToSupabase.js
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";

// ----------------------
// MongoDB Setup
// ----------------------
const MONGO_URI =
  "mongodb+srv://diksha_db_user:Sajdik029@ems-cluster.lh6k9rh.mongodb.net/employee_management?retryWrites=true&w=majority&appName=EMS-Cluster";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));


// ----------------------
// Supabase Setup
// ----------------------
const SUPABASE_URL = "https://xwipkmjonfsgrtdacggo.supabase.co";

const SUPABASE_SERVICE_ROLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aXBrbWpvbmZzZ3J0ZGFjZ2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDQzMCwiZXhwIjoyMDcxOTM2NDMwfQ.58kyEZLpq2W5BpfvfO-vREaGo227wAFUVpRTkV02pcY";

const BUCKET_NAME = "employee-documents";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);


// ----------------------
// Employee Model
// ----------------------
const employeeSchema = new mongoose.Schema({
  file_data: String,      // Base64 image stored here
  profileImage: String    // This will store new Supabase URL
});

const Employee = mongoose.model("Employee", employeeSchema);


// ----------------------
// Migration Logic
// ----------------------
async function migrate() {
  try {
    const employees = await Employee.find();

    for (const emp of employees) {
      if (!emp.file_data) continue;

      console.log(`Processing employee: ${emp._id}`);

      // Remove prefix if exists (data:image/webp;base64,...)
      const base64Data = emp.file_data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // File name inside Supabase
      const fileName = `employee_${emp._id}.webp`;

      // Upload to Supabase bucket
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: "image/webp",
          upsert: true
        });

      if (error) {
        console.error(`❌ Upload Error (${fileName}):`, error.message);
        continue;
      }

      // Get public file URL
      const { data: publicURL } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // Save Supabase URL in DB
      emp.profileImage = publicURL.publicUrl;
      await emp.save();

      console.log(`✅ Uploaded & updated: ${fileName}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration Error:", err);
    process.exit(1);
  }
}

migrate();
