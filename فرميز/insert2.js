
const url = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/settings";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { 
  "apikey": key, 
  "Authorization": "Bearer " + key,
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
};
const defaultSet = { whatsapp: "", instagram: "", email: "", location: "", logo_url: "" };

fetch(url, { method: "POST", headers, body: JSON.stringify(defaultSet) })
  .then(res => console.log(res.status))
  .catch(err => console.error("ERR", err));

