import requests

url = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/faq_official"
headers = {
    "apikey": "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy",
    "Authorization": "Bearer sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

faqs = [
    {
        "question": "ما هي معدات التصوير المستخدمة؟",
        "answer": "نستخدم أحدث الكاميرات السينمائية مثل Sony A7SIII و FX3 لضمان جودة عالمية.",
        "is_featured": True,
        "sort_order": 1
    },
    {
        "question": "كم يستغرق مونتاج الفيديو؟",
        "answer": "يستغرق المونتاج العادي ما بين 2 إلى 5 أيام عمل لضمان خروج الألوان والصوت بأعلى جودة.",
        "is_featured": True,
        "sort_order": 2
    },
    {
        "question": "هل تقدمون خدمات خارج القاهرة؟",
        "answer": "نعم، نحن نتحرك لتصوير مشاريعكم في كافة محافظات مصر وخارجها أيضاً.",
        "is_featured": False,
        "sort_order": 3
    }
]

response = requests.post(url, headers=headers, json=faqs)
print(response.status_code)
print(response.text)
