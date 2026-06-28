
const url = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/hero";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { "apikey": key, "Authorization": "Bearer " + key };
fetch(url, { headers })
  .then(res => res.json().then(data => console.log(JSON.stringify(data, null, 2))))
  .catch(err => console.error("ERR", err));

