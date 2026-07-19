
const url = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/portfolio";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", "Prefer": "return=minimal" };

const dummyData = [
  { "title": "???? ?? - ?????????", "category": "studio", "orientation": "horizontal", "url": "https://www.w3schools.com/html/mov_bbb.mp4", "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Quran_Kareem.svg/800px-Quran_Kareem.svg.png" },
  { "title": "????? ?????", "category": "studio", "orientation": "vertical", "url": "https://www.w3schools.com/html/mov_bbb.mp4", "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Quran_Kareem.svg/800px-Quran_Kareem.svg.png" }
];

fetch(url, { method: "POST", headers, body: JSON.stringify(dummyData) })
  .then(res => console.log("OK", res.status))
  .catch(err => console.error("ERR", err));

