import { createClient } from "@supabase/supabase-js";
import env from "dotenv";

env.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration. Required: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY).",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
