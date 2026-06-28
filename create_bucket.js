
const url = "https://htvnmyeawyptzpeehghq.supabase.co/storage/v1/bucket";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { 
  "apikey": key, 
  "Authorization": "Bearer " + key, 
  "Content-Type": "application/json" 
};
const body = { "id": "os", "name": "os", "public": true };

fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
  .then(res => res.json().then(data => console.log(res.status, data)))
  .catch(err => console.error("ERR", err));

