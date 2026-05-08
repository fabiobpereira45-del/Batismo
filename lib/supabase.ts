import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Cliente público (para operações do lado do cliente)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente admin (comentado para evitar erros de build na Vercel)
// export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || "");