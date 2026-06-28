const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Config from your file
const supabaseUrl = 'https://ovunzzasbwocqfpgpoyw.supabase.co';
const supabaseKey = 'YOUR_KEY_HERE'; // I should get this from supabase-config.js

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const faqs = [
        {
            question: "ما هي معدات التصوير المستخدمة؟",
            answer: "نستخدم أحدث الكاميرات السينمائية مثل Sony A7SIII و FX3 لضمان جودة عالمية.",
            is_featured: true,
            sort_order: 1
        },
        {
            question: "كم يستغرق مونتاج الفيديو؟",
            answer: "يستغرق المونتاج العادي ما بين 2 إلى 5 أيام عمل لضمان خروج الألوان والصوت بأعلى جودة.",
            is_featured: true,
            sort_order: 2
        },
        {
            question: "هل تقدمون خدمات خارج القاهرة؟",
            answer: "نعم، نحن نتحرك لتصوير مشاريعكم في كافة محافظات مصر وخارجها أيضاً.",
            is_featured: false,
            sort_order: 3
        }
    ];

    console.log("Seeding Official FAQs...");
    const { data, error } = await supabase.from('faq_official').insert(faqs);
    if (error) console.error("Error seeding:", error);
    else console.log("Seeded successfully:", data);
}

seed();
