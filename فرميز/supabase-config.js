// Supabase Database Connection Config
const SUPABASE_URL = "https://htvnmyeawyptzpeehghq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase library not loaded!");
}
