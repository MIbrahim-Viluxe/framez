
const urlBase = "https://htvnmyeawyptzpeehghq.supabase.co/rest/v1/";
const key = "sb_publishable_RHJPDdAFiFeSIf1ZdZqy8Q_pm14AyAy";
const headers = { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json" };

async function cleanTable(table) {
  try {
    const res = await fetch(`${urlBase}${table}?select=id&order=id.asc`, { headers });
    const rows = await res.json();
    if(rows.length > 1) {
      // Keep the last one, delete the rest
      const toDelete = rows.slice(0, rows.length - 1).map(r => r.id);
      for(let id of toDelete) {
        await fetch(`${urlBase}${table}?id=eq.${id}`, { method: "DELETE", headers });
        console.log(`Deleted ${id} from ${table}`);
      }
    } else {
      console.log(`${table} is clean`);
    }
  } catch(e) { console.error("ERR", e); }
}

cleanTable("hero").then(() => cleanTable("settings"));

