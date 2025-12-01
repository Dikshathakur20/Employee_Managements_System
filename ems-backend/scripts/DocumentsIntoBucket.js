import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://xwipkmjonfsgrtdacggo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aXBrbWpvbmZzZ3J0ZGFjZ2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MDQzMCwiZXhwIjoyMDcxOTM2NDMwfQ.58kyEZLpq2W5BpfvfO-vREaGo227wAFUVpRTkV02pcY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Convert Base64 → Buffer
function base64ToBuffer(base64String) {
  try {
    const base64Data = base64String.split(",")[1];
    return Buffer.from(base64Data, "base64");
  } catch {
    return null;
  }
}

async function migrateDocuments() {
  console.log("🚀 Starting document migration...");

  // ✅ Fetch all documents
  const { data: documents, error: fetchError } = await supabase
    .from("tbldocuments")
    .select("id, employee_id, file_url, file_name");

  if (fetchError) {
    console.error("❌ Error fetching documents:", fetchError.message);
    return;
  }

  for (const doc of documents) {
    if (!doc.file_url || !doc.file_url.startsWith("data:")) {
      console.log(`⚠️ Skipping doc ID ${doc.id} (no valid Base64 data)`);
      continue;
    }

    try {
      const buffer = base64ToBuffer(doc.file_url);
      if (!buffer) {
        console.warn(`⚠️ Could not parse Base64 for doc ID ${doc.id}`);
        continue;
      }

      const fileName = `employee_${doc.employee_id}_${doc.file_name}`;

      // ✅ Upload document to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(fileName, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // ✅ Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl;

      // ✅ Update tbldocuments with public URL
      const { error: updateError } = await supabase
        .from("tbldocuments")
        .update({ file_url: publicUrl })
        .eq("id", doc.id);

      if (updateError) throw updateError;

      console.log(`✅ Doc ID ${doc.id}: migrated successfully.`);
    } catch (err) {
      console.error(`❌ Error processing doc ID ${doc.id}:`, err.message);
    }
  }

  console.log("🎉 Migration completed successfully!");
}

migrateDocuments();
