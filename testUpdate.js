
const url = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/hero?id=eq.1";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { 
  "apikey": key, 
  "Authorization": "Bearer " + key,
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
};
const data = { is_visible: "true" }; // Simulate FormData passing string

fetch(url, { method: "PATCH", headers, body: JSON.stringify(data) })
  .then(res => res.text().then(text => console.log(res.status, text)))
  .catch(err => console.error("ERR", err));

