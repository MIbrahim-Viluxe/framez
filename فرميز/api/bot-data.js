import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Use environment variables for security)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    try {
        // Fetch the structured JSON from Supabase settings table
        const { data, error } = await supabase
            .from('settings')
            .select('content')
            .eq('id', 'ai_kb_json')
            .single();

        if (error) throw error;

        const botData = JSON.parse(data.content);

        // Return clean, structured JSON
        res.status(200).json({
            success: true,
            status: "online",
            last_updated: new Date().toISOString(),
            data: {
                services: botData.services || [],
                working_hours: botData.workingHours || "Not specified",
                faqs: botData.faqs || [],
                contact_info: {
                    phone: botData.contact?.phone || "",
                    whatsapp: botData.contact?.whatsapp || "",
                    email: botData.contact?.email || ""
                }
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch bot data",
            message: err.message
        });
    }
}
