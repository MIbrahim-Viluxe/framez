// FrameZ Admin Pro Logic
let works = [], studios = [], packages = [], bts = [], messages = [], celebrities = [], faqOfficial = [], chatbotKB = [], unanswered = [], priceList = [], currentHero = null;
let currentTable = '';
let editId = null;

// Auth Check (Simplified for Easy Entry)
const checkAuth = () => {
    const isAuth = localStorage.getItem('framez_admin_auth');
    if (isAuth === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        init();
    }
};

window.handleLogin = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const loader = document.getElementById('loginLoader');
    
    // Custom logic: accepts your specific credentials instantly
    if (email === 'ahmadsalama@framez.com' && pass === '123456') {
        loader.style.display = 'inline-block';
        localStorage.setItem('framez_admin_auth', 'true');
        setTimeout(() => {
            document.getElementById('loginOverlay').style.display = 'none';
            init();
            loader.style.display = 'none';
        }, 500);
    } else {
        alert("بيانات الدخول غير صحيحة.. جرب ايميلك مع الرقم 123456");
    }
};

window.logout = () => {
    localStorage.removeItem('framez_admin_auth');
    location.reload();
};

// Section Management
window.goSec = (id, btn) => {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    btn.classList.add('active');
    
    // Close sidebar on mobile after selection
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar && window.innerWidth <= 992) {
        sidebar.classList.remove('active');
    }
};

window.toggleSidebar = () => {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.toggle('active');
};

const showToast = (msg, type = 'success') => {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    t.style.background = type === 'success' ? '#fff' : '#ff5050';
    t.style.color = type === 'success' ? '#000' : '#fff';
    setTimeout(() => t.style.display = 'none', 3000);
};

// Data Fetching
const init = async () => {
    showToast("جاري تحميل البيانات...", "success");
    try {
        const [heroRes, studioRes, workRes, btsRes, packRes, msgRes, setRes, chatbotKBRes, unansweredRes, celebritiesRes, faqOfficialRes] = await Promise.all([
            supabaseClient.from('hero').select('*').limit(1).maybeSingle(),
            supabaseClient.from('studios').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('portfolio').select('*').order('sort_order', { ascending: true }),
            supabaseClient.from('bts_videos').select('*'),
            supabaseClient.from('packages').select('*'),
            supabaseClient.from('contacts').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('settings').select('*').limit(1).maybeSingle(),
            supabaseClient.from('faq_data').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('chatbot_unanswered').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('celebrities').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('faq_official').select('*').order('sort_order', { ascending: true })
        ]);

        if (heroRes.data) {
            currentHero = heroRes.data;
            fillForm('heroForm', currentHero);
        }
        if (setRes && setRes.data) {
            fillForm('settingsForm', setRes.data);
            fillForm('priceBoardSettingsForm', setRes.data);
            // Fill Hero Settings
            if(setRes.data && document.getElementById('heroVisualSettingsForm')) {
                fillForm('heroVisualSettingsForm', setRes.data);
                // Update labels
                document.querySelectorAll('#heroVisualSettingsForm .range-val').forEach(span => {
                    const input = span.previousElementSibling;
                    if(input) span.innerText = input.value;
                });
            }
            if(setRes.data.logo_url) {
                const logoBox = document.querySelector('.logo-box');
                if(logoBox) logoBox.innerHTML = `<img src="${setRes.data.logo_url}" style="height: 40px; margin-right: 10px; object-fit:contain;">`;
            }
        }
        studios = studioRes.data || [];
        works = workRes.data || [];
        bts = btsRes.data || [];
        packages = packRes.data || [];
        messages = msgRes.data || [];
        chatbotKB = (typeof chatbotKBRes !== 'undefined') ? chatbotKBRes.data || [] : [];
        unanswered = (typeof unansweredRes !== 'undefined') ? unansweredRes.data || [] : [];
        celebrities = (typeof celebritiesRes !== 'undefined') ? celebritiesRes.data || [] : [];
        faqOfficial = (typeof faqOfficialRes !== 'undefined') ? faqOfficialRes.data || [] : [];

        const { data: q } = await supabaseClient.from('price_list').select('*').order('sort_order', { ascending: true });
        priceList = q || [];

        renderAll();
    } catch (err) {
        console.error(err);
    }
};

const renderAll = () => {
    renderStudios();
    renderPortfolio();
    renderBTS();
    renderPackages();
    renderMessages();
    renderCelebrities();
    renderChatbotKB();
    renderUnanswered();
    renderFAQAdminGrid();
    renderPriceListTable();
};

// Render Functions
const renderStudios = () => {
    const g = document.getElementById('studiosGrid');
    g.innerHTML = studios.map(s => `
        <div class="item-card">
            <img src="${s.image_url}" class="item-img" onerror="this.src='https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400'">
            <div style="font-weight:700;">${s.name_ar}</div>
            <p style="font-size:0.8rem; color:var(--text-dim);">${s.name_en}</p>
            <div class="item-actions">
                <button class="btn btn-sm btn-gold" onclick="openUniModal('studios', ${s.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('studios', ${s.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا يوجد استوديوهات حالياً.</p>';
};

const getYouTubeId = (url) => {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getYTThumb = (url) => {
    if(!url) return '';
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : url;
};

const renderPortfolio = () => {
    const g = document.getElementById('portfolioGrid');
    g.innerHTML = works.map(w => {
        let displayImg = w.thumbnail || w.url;
        if(displayImg && (displayImg.includes('youtube.com') || displayImg.includes('youtu.be'))) displayImg = getYTThumb(displayImg);
        
        const isVertical = w.orientation === 'vertical';
        return `
        <div class="item-card">
            <img src="${displayImg}" class="item-img" style="aspect-ratio: ${isVertical ? '9/16' : '16/9'}; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1485001564903-56e6a54d46ef?w=400'">
            <div style="font-weight:700;">${w.title}</div>
            <span style="font-size:0.75rem; background:var(--gold); color:#000; font-weight:bold; padding:4px 10px; border-radius:8px; display:inline-block; margin-top:5px;">${isVertical ? 'طولي (Reels)' : 'عرضي (Cinematic)'}</span>
            <div class="item-actions">
                <button class="btn btn-sm btn-gold" onclick="openUniModal('portfolio', ${w.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('portfolio', ${w.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `}).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا توجد أعمال مضافة.</p>';
};

const renderCelebrities = () => {
    const g = document.getElementById('celebGrid');
    if(!g) return;
    g.innerHTML = celebrities.map(c => `
        <div class="item-card">
            <img src="${c.image_url}" class="item-img" style="border-radius:50%; width:120px; height:120px; align-self:center; border:2px solid var(--gold);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; this.style.filter='invert(1)'">
            <div style="font-weight:700; text-align:center;">${c.name}</div>
            <p style="font-size:0.8rem; color:var(--text-dim); text-align:center;">${c.role}</p>
            <div class="item-actions">
                <button class="btn btn-sm btn-gold" onclick="openUniModal('celebrities', ${c.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('celebrities', ${c.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا يوجد مشاهير حالياً.</p>';
};

const renderBTS = () => {
    const g = document.getElementById('btsGrid');
    g.innerHTML = bts.map(v => {
        const ytid = getYouTubeId(v.url);
        let displayImg = v.thumbnail || v.url;
        if(displayImg && (displayImg.includes('youtube.com') || displayImg.includes('youtu.be'))) displayImg = getYTThumb(displayImg);
        
        const isVideo = v.url && (v.url.endsWith('.mp4') || v.url.endsWith('.webm') || v.url.includes('supabase.co/storage'));
        const mediaTag = (!ytid && isVideo) 
            ? `<video src="${v.url}#t=0.5" style="position:absolute; width:100%; height:100%; object-fit:cover; opacity:0.5;"></video>`
            : `<img src="${displayImg}" style="position:absolute; width:100%; height:100%; object-fit:cover; opacity:0.5;" onerror="this.src='https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400'">`;

        return `
        <div class="item-card">
            <div style="height:160px; background:#000; border-radius:12px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                ${mediaTag}
                <i class="fa-solid fa-play" style="color:var(--gold); font-size:2rem; opacity:0.6; position:relative; z-index:2;"></i>
                <div style="position:absolute; bottom:10px; right:10px; font-size:0.6rem; color: #fff; z-index:2;">${ytid ? 'YOUTUBE' : 'FILE'}</div>
            </div>
            <div style="font-weight:700; margin-top:10px;">${v.title}</div>
            <div class="item-actions">
                <button class="btn btn-sm btn-gold" onclick="openUniModal('bts_videos', ${v.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('bts_videos', ${v.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `}).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا توجد كواليس مضافة.</p>';
};

const renderPackages = () => {
    const g = document.getElementById('packagesGrid');
    g.innerHTML = packages.map(p => `
        <div class="item-card">
            <div style="font-weight:900; font-size:1.2rem; color:var(--gold);">${p.name}</div>
            <div style="font-size:1.5rem; font-weight:900;">${p.price} EGP</div>
            <div class="item-actions">
                <button class="btn btn-sm btn-gold" onclick="openUniModal('packages', ${p.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('packages', ${p.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا يوجد باقات حالياً.</p>';
};

const renderMessages = () => {
    const list = document.getElementById('messagesList');
    list.innerHTML = messages.map(m => `
        <div class="glass-card" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:900; font-size:1.1rem;">${m.name}</div>
                <div style="color:var(--gold); font-size:0.8rem; margin:5px 0;">${m.phone} | ${m.service || 'استفسار عام'}</div>
                <p style="opacity:0.8;">${m.message}</p>
                <span style="font-size:0.6rem; opacity:0.4;">${new Date(m.created_at).toLocaleString('ar-EG')}</span>
            </div>
            <div style="text-align:right;">
                <select onchange="updateMsgStatus(${m.id}, this.value)" style="background:#111; color:#fff; padding:8px; border:1px solid var(--border); border-radius:8px;">
                    <option value="New" ${m.status==='New'?'selected':''}>جديد</option>
                    <option value="Contacted" ${m.status==='Contacted'?'selected':''}>تم التواصل</option>
                    <option value="Closed" ${m.status==='Closed'?'selected':''}>مغلق</option>
                </select>
            </div>
        </div>
    `).join('') || '<div class="glass-card" style="text-align:center; color:var(--text-dim);">لا يوجد رسائل حتى الآن.</div>';
};

// Category icons map
const CAT_ICONS = { 'مونتاج': '🎬', 'تصوير': '📷', 'معدات': '🎥', 'لوكيشن': '📍' };
const CAT_COLORS = { 'مونتاج': '#a78bfa', 'تصوير': '#60a5fa', 'معدات': '#f59e0b', 'لوكيشن': '#34d399' };

const renderPriceListTable = () => {
    const b = document.getElementById('priceListTableBody');
    if(!b) return;
    b.innerHTML = priceList.map(p => {
        const icon = CAT_ICONS[p.category] || '📌';
        const color = CAT_COLORS[p.category] || 'var(--gold)';
        const hasImg = p.image_url && (p.category === 'معدات' || p.category === 'لوكيشن');
        return `
        <tr>
            <td><span class="badge" style="border-color:${color}20; color:${color};">${icon} ${p.category}</span></td>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    ${hasImg ? `<img src="${p.image_url}" style="width:40px; height:40px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">` : ''}
                    <span>${p.item_name}</span>
                </div>
            </td>
            <td>${p.price}</td>
            <td>${p.sort_order || 0}</td>
            <td>
                <div class="item-actions">
                    <button class="btn-icon btn-icon-edit" onclick="openUniModal('price_list', ${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-icon-del" onclick="deleteItem('price_list', ${p.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" style="text-align:center; opacity:0.3; padding:40px;">لا توجد بنود مضافة حالياً.. أضف أول بند الآن!</td></tr>';
};

const renderFAQAdminGrid = () => {
    const list = document.getElementById('faqAdminGrid');
    if(!list) return;
    list.innerHTML = faqOfficial.map(f => `
        <div class="item-card">
            <div style="font-weight:900; color:#fff; font-size:1.1rem;">${f.question}</div>
            <p style="font-size:0.8rem; color:var(--text-dim); line-height:1.5; margin:10px 0;">${f.answer}</p>
            <div style="margin-top:auto;" class="item-actions">
                <span class="badge" style="background:${f.is_featured?'var(--gold)':'rgba(255,255,255,0.05)'}; color:${f.is_featured?'#000':'#fff'}; border-radius:15px; padding:4px 10px; font-size:0.6rem;">${f.is_featured?'مهم بـ الرئيسية':'في صفحة الأسئلة'}</span>
                <button class="btn btn-sm btn-gold" onclick="openUniModal('faq_official', ${f.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('faq_official', ${f.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px;">لا يوجد أسئلة رسمية مضافة.</p>';
};

// CRUD Helpers
window.openUniModal = (table, id = null) => {
    currentTable = table;
    editId = id;
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('uniFields');
    title.innerText = id ? "تعديل البيانات" : "إضافة عنصر جديد";
    fields.innerHTML = '';
    
    let html = '';
    if(table === 'studios') {
        html = `
            <div class="form-grid">
                <div class="form-group"><label>اسم الاستوديو (عربي)</label><input type="text" name="name_ar" required></div>
                <div class="form-group"><label>Name (English)</label><input type="text" name="name_en" required></div>
                <div class="form-group"><label>الوصف (عربي)</label><textarea name="description_ar" rows="3"></textarea></div>
                <div class="form-group"><label>Description (English)</label><textarea name="description_en" rows="3"></textarea></div>
            </div>
            <div class="form-group"><label>رابط الصورة المباشر</label><input type="text" name="image_url" placeholder="URL" oninput="updateLivePreview(this.value)"></div>`;
    } else if(table === 'portfolio') {
        html = `
            <div class="grid-3">
                <div class="form-group"><label>عنوان العمل</label><input type="text" name="title" required></div>
                <div class="form-group"><label>الاتجاه (طولي / عرضي)</label><select name="orientation"><option value="horizontal">عرضي (Cinematic)</option><option value="vertical">طولي (Reels)</option></select></div>
                <div class="form-group"><label>ترتيب العرض</label><input type="number" name="sort_order" placeholder="0"></div>
            </div>
            <div class="form-group"><label>رابط الفيديو/الصورة</label><input type="text" name="url" placeholder="YouTube or Image URL" oninput="handleVideoThumb(this)"></div>
            <div class="form-group"><label>صورة مصغرة (Thumbnail)</label><input type="text" id="workThumb" name="thumbnail" oninput="updateLivePreview(this.value)" placeholder="اتركه فارغاً للسحب الآلي من يوتيوب"></div>`;
    } else if(table === 'bts_videos') {
        html = `
            <div class="form-group"><label>اسم الفيديو (كواليس)</label><input type="text" name="title" required></div>
            <div class="form-group"><label>رابط اليوتيوب (أو اتركه فارغاً للرفع المباشر)</label><input type="text" name="url" oninput="handleVideoThumb(this)" placeholder="https://youtube.com/shorts/..."></div>
            <div class="form-group"><label>صورة مصغرة مخصصة (اختياري)</label><input type="text" id="workThumb" name="thumbnail" oninput="updateLivePreview(this.value)" placeholder="رابط صورة لتكون واجهة الفيديو"></div>`;
    } else if(table === 'packages') {
        html = `
            <div class="form-grid">
                <div class="form-group"><label>اسم الباقة</label><input type="text" name="name" required></div>
                <div class="form-group"><label>السعر (LE)</label><input type="number" name="price" required></div>
            </div>
            <div class="form-group"><label>المميزات (افصل بـ فاصلة ,)</label><textarea name="features" rows="3" placeholder="تعديل احترافي، دقة عالية، إضاءة سينمائية..."></textarea></div>
            <div class="form-group"><label>هل هي باقة "نوصي بها"؟</label><select name="is_featured"><option value="false">لا</option><option value="true">نعم (سيظهر شريط تميز)</option></select></div>`;
    } else if(table === 'faq_data') {
        html = `
            <div class="form-group"><label>تصنيف الرد (مثل: أسعار)</label><input type="text" name="intent" required></div>
            <div class="form-group"><label>السؤال للمساعد الذكي</label><input type="text" name="question" required></div>
            <div class="form-group"><label>إجابة المساعد الذكي</label><textarea name="answer" rows="5" required></textarea></div>`;
    } else if(table === 'faq_official') {
        html = `
            <div class="form-group"><label>السؤال للموقع</label><input type="text" name="question" required></div>
            <div class="form-group"><label>الإجابة الرسمية للمشاهد</label><textarea name="answer" rows="5" required></textarea></div>
            <div class="form-group"><label>إظهار في "أهم الأسئلة" بالرئيسية؟</label><select name="is_featured"><option value="true">نعم (بالرئيسية)</option><option value="false">لا (بصفحة الـ FAQ)</option></select></div>
            <div class="form-group"><label>ترتيب العرض</label><input type="number" name="sort_order" value="0"></div>`;
    } else if(table === 'celebrities') {
        html = `
            <div class="form-grid">
                <div class="form-group"><label>اسم المشهور</label><input type="text" name="name" required></div>
                <div class="form-group"><label>الصفة (ممثل، مطرب، الخ)</label><input type="text" name="role" required></div>
            </div>
            <div class="form-group"><label>رابط الصورة المباشر</label><input type="text" name="image_url" placeholder="URL" oninput="updateLivePreview(this.value)"></div>
            <div class="form-group"><label>هل يظهر في الصفحة الرئيسية؟</label><select name="is_featured"><option value="true">نعم (يظهر في القائمة الرئيسية)</option><option value="false">لا</option></select></div>`;
    } else if(table === 'price_list') {
        html = `
            <div class="form-group">
                <label>التصنيف (القسم)</label>
                <input type="hidden" name="category" id="priceCategoryHidden" required>
                <div class="cat-pill-group">
                    <button type="button" class="cat-pill" data-val="مونتاج" onclick="selectCatPill(this)">
                        <i class="fa-solid fa-scissors"></i> مونتاج
                    </button>
                    <button type="button" class="cat-pill" data-val="تصوير" onclick="selectCatPill(this)">
                        <i class="fa-solid fa-camera-retro"></i> تصوير
                    </button>
                    <button type="button" class="cat-pill" data-val="معدات" onclick="selectCatPill(this)">
                        <i class="fa-solid fa-video"></i> معدات
                    </button>
                    <button type="button" class="cat-pill" data-val="لوكيشن" onclick="selectCatPill(this)">
                        <i class="fa-solid fa-clapperboard"></i> لوكيشن
                    </button>
                    <button type="button" class="cat-pill" data-val="__custom__" onclick="selectCatPill(this)">
                        <i class="fa-solid fa-plus"></i> تصنيف جديد
                    </button>
                </div>
            </div>
            <div class="form-group" id="customCategoryGroup" style="display:none;">
                <label>اكتب اسم التصنيف الجديد</label>
                <input type="text" id="customCategoryInput" placeholder="مثال: باقات" oninput="syncCustomCategory(this.value)">
            </div>
            <div class="form-group"><label>اسم الخدمة / البند</label><input type="text" name="item_name" placeholder="مثال: 1 Episode 60mins" required></div>
            <div class="form-group"><label>السعر</label><input type="text" name="price" placeholder="مثال: 1000 EGP" required></div>
            <div class="form-group"><label>ترتيب الظهور</label><input type="number" name="sort_order" placeholder="0"></div>
            <div class="form-group" id="priceImageUrlGroup" style="display:none;">
                <label>رابط الصورة (اختياري - بديل عن الرفع)</label>
                <input type="text" name="image_url" placeholder="https://..." oninput="updateLivePreview(this.value)">
            </div>`;
    }
    
    fields.innerHTML = html;

    // Handle upload group visibility based on table/category
    const uploadGroup = document.getElementById('uploadGroup');
    if(uploadGroup) {
        const noUploadTables = ['faq_data', 'faq_official', 'price_list'];
        uploadGroup.style.display = noUploadTables.includes(table) ? 'none' : 'block';
    }

    if(id) {
        const item = findItem(table, id);
        // Clear live preview before filling form
        updateLivePreview('');
        fillForm('uniForm', item);
        // For price_list: activate the right pill
        if(table === 'price_list' && item) {
            const presets = ['مونتاج', 'تصوير', 'معدات', 'لوكيشن'];
            const cat = item.category || '';
            // Set hidden input value
            const hidden = document.getElementById('priceCategoryHidden');
            if(hidden) hidden.value = cat;
            // Find & activate matching pill
            const matchingPill = document.querySelector(`.cat-pill[data-val="${CSS.escape(cat)}"]`);
            if(matchingPill) {
                selectCatPill(matchingPill);
            } else if(cat && !presets.includes(cat)) {
                // Legacy/custom category
                const customPill = document.querySelector('.cat-pill[data-val="__custom__"]');
                if(customPill) selectCatPill(customPill);
                const ci = document.getElementById('customCategoryInput');
                if(ci) ci.value = cat;
                syncCustomCategory(cat);
            }
            if(item.image_url) updateLivePreview(item.image_url);
        }
    } else {
        // New item: clear preview
        updateLivePreview('');
    }
    document.getElementById('uniModal').classList.add('active');
};

window.closeModal = () => {
    document.getElementById('uniModal').classList.remove('active');
    document.getElementById('uniForm').reset();
    document.getElementById('livePreview').innerHTML = 'معاينة حية للصورة';
};

const findItem = (table, id) => {
    if(table === 'studios') return studios.find(x => x.id === id);
    if(table === 'portfolio') return works.find(x => x.id === id);
    if(table === 'bts_videos') return bts.find(x => x.id === id);
    if(table === 'packages') return packages.find(x => x.id === id);
    if(table === 'celebrities') return celebrities.find(x => x.id === id);
    if(table === 'faq_official') return faqOfficial.find(x => x.id === id);
    if(table === 'faq_data') return (typeof chatbotKB !== 'undefined' ? chatbotKB : []).find(x => x.id === id);
    if(table === 'price_list') return priceList.find(x => x.id === id);
    return null;
};

const fillForm = (formId, data) => {
    const f = document.getElementById(formId);
    if(!f || !data) return;
    Object.keys(data).forEach(key => {
        const field = f.elements[key];
        if(field) {
            if(key === 'features' && Array.isArray(data[key])) field.value = data[key].join(', ');
            else field.value = data[key];
        }

        // Specialized handling for dynamic terms list
        if(key === 'terms_and_conditions' && formId === 'priceBoardSettingsForm') {
            const container = document.getElementById('termsListContainer');
            if(container) {
                container.innerHTML = ''; // Clear existing
                const lines = (data[key] || "").split('\n').filter(l => l.trim() !== '');
                if(lines.length > 0) {
                    lines.forEach(line => addNewTermLine(line));
                } else {
                    addNewTermLine(); // Add one empty line by default
                }
            }
        }
    });
    if(data.image_url || data.thumbnail || data.url) updateLivePreview(data.image_url || data.thumbnail || data.url);
};

// Save Master Logic
document.getElementById('uniForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loader = document.getElementById('saveLoader'); // Match HTML ID
    const fileIn = document.getElementById('fileInput');
    const progCont = document.getElementById('progressContainer');
    
    // Get the button that triggered the submit
    const btn = e.submitter || e.target.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML;

    if (loader) loader.style.display = 'inline-block';
    btn.disabled = true;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Debugging Save
    console.log("Saving for table:", currentTable, "Edit ID:", editId, "Data:", data);

    // Clean data: prevent Supabase identity column errors
    delete data.id; 
    delete data.table; 

    // Handle File Upload first
    if (fileIn && fileIn.files.length > 0) {
        const file = fileIn.files[0];
        if (progCont) progCont.style.display = 'block';
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${currentTable}/${fileName}`;

        try {
            const { error: uploadErr } = await supabaseClient.storage
                .from('os')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabaseClient.storage.from('os').getPublicUrl(filePath);
            
            if (currentTable === 'studios' || currentTable === 'celebrities') data.image_url = publicUrl;
            else if (currentTable === 'portfolio' || currentTable === 'bts_videos') data.url = publicUrl;
            else if (currentTable === 'packages') data.image = publicUrl;
            else if (currentTable === 'price_list') data.image_url = publicUrl;
        } catch (err) {
            alert("Upload Error: " + err.message);
            if (loader) loader.style.display = 'none';
            btn.innerHTML = oldText;
            btn.disabled = false;
            return;
        } finally {
            if (progCont) progCont.style.display = 'none';
        }
    }
    
    // Feature formatting for packages
    if(currentTable === 'packages' && data.features) {
        data.features = data.features.split(',').map(x => x.trim()).filter(x => x);
    }

    try {
        let result;
        if(editId) {
            // Clean data for boolean fields
            if(data.is_featured === 'true' || data.is_featured === 'false') data.is_featured = (data.is_featured === 'true');
            if(data.is_visible === 'true' || data.is_visible === 'false') data.is_visible = (data.is_visible === 'true');
            if(data.is_active === 'true' || data.is_active === 'false') data.is_active = (data.is_active === 'true');

            result = await supabaseClient.from(currentTable).update(data).eq('id', editId);
        } else {
            // New items: handle booleans and defaults
            if(data.is_featured === 'true' || data.is_featured === 'false') data.is_featured = (data.is_featured === 'true');
            if(data.is_visible === 'true' || data.is_visible === 'false') data.is_visible = (data.is_visible === 'true');
            if(currentTable === 'bts_videos') data.is_active = true;

            result = await supabaseClient.from(currentTable).insert([data]);
        }
        
        if (result.error) {
            console.error("Supabase Save Error:", result.error);
            throw result.error;
        }

        // Auto-cleanup for conversions
        if(currentTable === 'faq_data' && currentConvertId) {
            await supabaseClient.from('chatbot_unanswered').delete().eq('id', currentConvertId);
            currentConvertId = null;
        }

        showToast("✓ تم حفظ البيانات بنجاح!");
        closeModal();
        await init(); 
    } catch(err) {
        console.error("Final Save Error:", err);
        alert("Error during save: " + err.message);
        showToast("✕ خطأ: " + err.message, "danger");
    } finally {
        if (loader) loader.style.display = 'none';
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
});

window.saveHero = async () => {
    const f = document.getElementById('heroForm');
    const btn = document.querySelector('#heroSec .btn-gold');
    const oldText = btn.innerHTML;
    const videoFileIn = document.getElementById('heroVideoUpload');
    const data = Object.fromEntries(new FormData(f).entries());
    
    // Convert boolean
    if(data.is_visible) data.is_visible = (data.is_visible === 'true');

    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

        // Handle Video Upload if user selected a file
        if (videoFileIn && videoFileIn.files.length > 0) {
            showToast("جاري رفع الفيديو الجديد...", "success");
            const file = videoFileIn.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `hero_${Date.now()}.${fileExt}`;
            const filePath = `hero/${fileName}`;

            const { error: uploadErr } = await supabaseClient.storage
                .from('os')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabaseClient.storage.from('os').getPublicUrl(filePath);
            data.video_url = publicUrl; 
        }

        const { data: existing, error: fetchErr } = await supabaseClient.from('hero').select('id').limit(1).maybeSingle();
        if (fetchErr) throw fetchErr;
        
        const { error: saveErr } = existing 
            ? await supabaseClient.from('hero').update(data).eq('id', existing.id)
            : await supabaseClient.from('hero').insert([data]);
        
        if (saveErr) throw saveErr;
        
        showToast("تم حفظ واجهة الموقع وفيديو الخلفية!");
        if (videoFileIn) videoFileIn.value = ''; 
        await init(); // Refresh data
    } catch(err) { 
        console.error(err);
        showToast("✕ خطأ: " + err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
};

window.revertHeroVideo = async () => {
    if(!confirm("هل أنت متأكد من حذف فيديو الخلفية والعودة للجريد الأصلي؟")) return;
    const fileInput = document.getElementById('heroVideoUpload');
    const urlInput = document.getElementById('heroVideoUrlInput');
    if (fileInput) fileInput.value = '';
    if (urlInput) {
        urlInput.value = '';
        await saveHero();
        showToast("تمت إزالة الفيديو والعودة للجريد!");
    }
};

window.saveSettings = async () => {
    const f = document.getElementById('settingsForm');
    const btn = document.querySelector('#settingsSec .btn-gold');
    const oldText = btn.innerHTML;
    const fileInput = document.getElementById('logoUpload');
    const data = Object.fromEntries(new FormData(f).entries());
    
    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

        // Handle File Upload if user selected a Logo PNG
        if (fileInput && fileInput.files.length > 0) {
            showToast("جاري رفع اللوجو الجديد...", "success");
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `logo_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadErr } = await supabaseClient.storage
                .from('os')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabaseClient.storage.from('os').getPublicUrl(filePath);
            data.logo_url = publicUrl; 
        }

        const { data: existing, error: fetchErr } = await supabaseClient.from('settings').select('id').limit(1).maybeSingle();
        if (fetchErr) throw fetchErr;

        const { error: saveErr } = existing
            ? await supabaseClient.from('settings').update(data).eq('id', existing.id)
            : await supabaseClient.from('settings').insert([data]);
        
        if (saveErr) throw saveErr;

        showToast("تم حفظ الإعدادات!");
        if (fileInput) fileInput.value = ''; 
        await init(); // Refresh data
    } catch(err) { 
        console.error(err);
        showToast("✕ خطأ: " + err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
};

window.savePriceBoardSettings = async () => {
    const f = document.getElementById('priceBoardSettingsForm');
    const btn = document.querySelector('#priceBoardSettingsForm .btn-gold');
    const oldText = btn.innerHTML;
    
    // Sync dynamic terms to hidden input before gathering data
    const terms = Array.from(document.querySelectorAll('.term-row-input')).map(input => input.value.trim()).filter(v => v !== '');
    const termsInput = document.getElementById('termsHiddenInput');
    if(termsInput) termsInput.value = terms.join('\n');

    const data = Object.fromEntries(new FormData(f).entries());

    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

        const { data: existing, error: fetchErr } = await supabaseClient.from('settings').select('id').limit(1).maybeSingle();
        if (fetchErr) throw fetchErr;

        const { error: saveErr } = existing
            ? await supabaseClient.from('settings').update(data).eq('id', existing.id)
            : await supabaseClient.from('settings').insert([data]);

        if (saveErr) throw saveErr;

        showToast("تم حفظ شروط وملاحظات اللوحة!");
        await init(); 
    } catch(err) {
        console.error(err);
        showToast("✕ خطأ: " + err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
};

window.saveHeroVisualSettings = async () => {
    const f = document.getElementById('heroVisualSettingsForm');
    const btn = document.querySelector('#heroVisualSettingsForm .btn-gold');
    const oldText = btn.innerHTML;
    const data = Object.fromEntries(new FormData(f).entries());

    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;
        const { data: existing, error: fetchErr } = await supabaseClient.from('settings').select('id').limit(1).maybeSingle();
        if (fetchErr) throw fetchErr;
        const { error: saveErr } = existing
            ? await supabaseClient.from('settings').update(data).eq('id', existing.id)
            : await supabaseClient.from('settings').insert([data]);
        if (saveErr) throw saveErr;
        showToast("تم حفظ إعدادات الهيرو البصرية!");
    } catch(err) {
        console.error(err);
        showToast("✕ خطأ: " + err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
};

window.revertLogo = async () => {
    if(!confirm("هل متأكد من العودة للوجو الموقع الأصلي (FrameZ)؟")) return;
    const fileInput = document.getElementById('logoUpload');
    const urlInput = document.getElementById('logoUrlInput');
    if (fileInput) fileInput.value = '';
    if (urlInput) {
        urlInput.value = '';
        
        // Revert UI icon in dashboard back to original
        const logoBox = document.querySelector('.logo-box');
        if(logoBox) {
            logoBox.innerHTML = `
                <div class="z" style="width: 40px; height: 40px; background: var(--gold); color: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem;">Z</div>
                <div style="font-weight: 900; font-size: 1.2rem; gap: 12px; display: flex; align-items: center; padding-right: 10px;">FrameZ</div>
            `;
        }
        await saveSettings();
    }
};

window.deleteItem = async (table, id) => {
    if(!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    try {
        const { error: delErr } = await supabaseClient.from(table).delete().eq('id', id);
        if(delErr) throw delErr;
        showToast("تم الحذف بنجاح!");
        await init();
    } catch(err) { alert("خطأ في الحذف: " + err.message); }
};

window.updateMsgStatus = async (id, status) => {
    try {
        await supabaseClient.from('contacts').update({ status }).eq('id', id);
        showToast("تم تحديث حالة الرسالة!");
    } catch(err) { alert(err.message); }
};

// Price List Category Pill Selector
window.selectCatPill = (pillBtn) => {
    // Deactivate all pills
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pillBtn.classList.add('active');

    const val = pillBtn.dataset.val;
    const hidden = document.getElementById('priceCategoryHidden');
    if(hidden) hidden.value = (val === '__custom__') ? '' : val;

    handlePriceCategoryChange(val);
};

// Price List Category Handler
window.handlePriceCategoryChange = (cat) => {
    const imgGroup     = document.getElementById('priceImageUrlGroup');
    const uploadGroup  = document.getElementById('uploadGroup');
    const customGroup  = document.getElementById('customCategoryGroup');

    // Show/hide custom text input
    const isCustom = (cat === '__custom__');
    if(customGroup) customGroup.style.display = isCustom ? 'block' : 'none';
    if(isCustom) {
        const ci = document.getElementById('customCategoryInput');
        if(ci) setTimeout(() => ci.focus(), 50);
    } else {
        const customInput = document.getElementById('customCategoryInput');
        if(customInput) customInput.value = '';
    }

    // Show image upload only for معدات & لوكيشن
    const needsImage = (cat === 'معدات' || cat === 'لوكيشن');
    if(imgGroup)    imgGroup.style.display    = needsImage ? 'block' : 'none';
    if(uploadGroup) uploadGroup.style.display = needsImage ? 'block' : 'none';
    if(!needsImage) updateLivePreview('');
};

// Sync custom category text to hidden input
window.syncCustomCategory = (val) => {
    const hidden = document.getElementById('priceCategoryHidden');
    if(hidden) hidden.value = val;
};

// Utilities
window.updateLivePreview = url => {
    const b = document.getElementById('livePreview'); if(!b) return;
    if(url) {
        b.style.display = 'flex';
        b.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain; border-radius:15px;">`;
    } else {
        b.style.display = 'none';
        b.innerHTML = '';
    }
};

window.handleVideoThumb = el => {
    const url = el.value;
    const m = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if(m && m[1]) {
        const t = `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
        const inP = document.getElementById('workThumb'); if(inP) { inP.value = t; updateLivePreview(t); }
    } else { updateLivePreview(url); }
};

window.handleFileUpload = el => {
    window.updateFileName(el);
};

window.updateFileName = el => {
    const label = document.querySelector('.upload-zone div'); // Fixed selector to find the label inside zone
    if (el.files && el.files.length > 0) {
        label.innerText = `المختار: ${el.files[0].name}`;
        label.style.color = 'var(--gold)';
        
        // Show Instant Local Preview!
        const file = el.files[0];
        if (file.type.startsWith('image/')) {
            updateLivePreview(URL.createObjectURL(file));
        } else if (file.type.startsWith('video/')) {
            const b = document.getElementById('livePreview');
            if(b) {
                b.style.display = 'flex';
                b.innerHTML = `<video src="${URL.createObjectURL(file)}" controls style="width:100%; height:100%; object-fit:contain; border-radius:15px;"></video>`;
            }
        }
    } else {
        label.innerText = 'سحب وإفلات أو اضغط للاختيار';
        label.style.color = 'var(--text-dim)';
        updateLivePreview('');
    }
};

window.clearFile = () => {
    const fileIn = document.getElementById('fileInput');
    fileIn.value = '';
    window.updateFileName(fileIn);
    window.updateLivePreview('');
};

// --- Chatbot Specific Renderers ---
const renderChatbotKB = () => {
    const list = document.getElementById('kbList');
    if(!list) return;
    list.innerHTML = chatbotKB.map(k => `
        <tr style="border-bottom: 1px solid var(--border); transition: 0.3s; opacity: ${k.is_active ? '1' : '0.5'}" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: 700; color: var(--gold);">${k.intent || '-'}</td>
            <td style="padding: 15px; color: #fff;">${k.question}</td>
            <td style="padding: 15px; font-size: 0.85rem; max-width: 400px; color:rgba(255,255,255,0.8);">${k.answer}</td>
            <td style="padding: 15px; text-align: left;">
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-sm" style="background:none; border:none; color:${k.is_active ? 'var(--gold)' : '#555'}; font-size: 1.1rem;" onclick="toggleFAQVisibility(${k.id}, ${k.is_active})" title="${k.is_active ? 'إخفاء عن البوت' : 'إظهار للبوت'}">
                        <i class="fa-solid ${k.is_active ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button class="btn btn-sm" style="background: rgba(255,255,255,0.05); color: #fff;" onclick="openUniModal('faq_data', ${k.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('faq_data', ${k.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4" style="padding:30px; text-align:center; color:var(--text-dim);">لا توجد بيانات مُدخلة بعد.</td></tr>';
};

window.toggleFAQVisibility = async (id, currentStatus) => {
    try {
        const { error } = await supabaseClient.from('faq_data').update({ is_active: !currentStatus }).eq('id', id);
        if(error) throw error;
        showToast(`تم ${!currentStatus ? 'تفعيل' : 'إخفاء'} الرد بنجاح`);
        await init();
    } catch(err) { alert(err.message); }
};

window.openKBModal = () => openUniModal('faq_data');

window.seedKB = async () => {
    if(!confirm("هل تود تغذية البوت ببيانات استوديو احترافية؟ (سيتم إضافة الجديد وتنظيف الأسئلة غير المجابة التي تشابه البيانات الجديدة تلقائياً)")) return;
    
    try {
        // 1. Fetch existing FAQ data
        const { data: existingKB } = await supabaseClient.from('faq_data').select('question');
        const existingQuestions = (existingKB || []).map(k => k.question);

        const initialKnowledge = [
            { intent: "Identity", q: "انتوا مين وبتعملوا إيه؟", a: "أهلاً بيك! إحنا استوديو FrameZ متخصصين في التصوير والمونتاج السينمائي الاحترافي، بنحول أفكارك لفيديوهات مبهرة." },
            { intent: "Pricing", q: "سعر تصوير الفيديو كام؟", a: "الأسعار بتفرق حسب الباقة والـ Setup اللي هتختاره. عندنا باقات متنوعة بتبدأ من البسيطة لحد الاحترافية الكاملة." },
            { intent: "Location", q: "مكان الاستوديو فين بالظبط؟", a: "إحنا في التجمع الخامس، القاهرة. وممكن نبعتلك اللوكيشن على الواتساب لو حابب تنورنا." },
            { intent: "Timeline", q: "المونتاج بيخلص في قد إيه؟", a: "العادي بياخد من يومين لـ 5 أيام عمل، وده عشان نطلع لك أعلى جودة في تلوين وتعديل الفيديو." },
            { intent: "Quality", q: "إيه الفرق بينكم وبين أي حد تاني؟", a: "الفرق في 'النفس السينمائي'. إحنا مش بس بنقص ونلزق، إحنا بنهتم بالإضاءة، جودة الصوت، وتلوين الفيديو بأسلوب أفلام السينما." },
            { intent: "Setup", q: "عندكم معدات إيه؟", a: "بنستخدم كاميرات سينمائية وعدسات احترافية، مع نظام إضاءة متكامل وميكروفونات عازلة للصوت عشان يطلع محتواك في أحسن صورة." },
            { intent: "Beginner", q: "أنا أول مرة أصور، هتعرفوا تساعدوني؟", a: "طبعاً! إحنا بنوجهك وبنقولك تقف إزاي وتتكلم إزاي، وبنعمل لك سكريبت لو محتاج. مفيش قلق خالص." },
            { intent: "Dresscode", q: "ألبس إيه وأنا جاي أصور؟", a: "يفضل ألوان سادة وهادية، وابعد عن النقشات الكتير (زي المربعات الصغيرة) عشان الكاميرا بتحب البساطة." },
            { intent: "Revisions", q: "ممكن أعدل حاجة في الفيديو بعد ما يخلص؟", a: "أكيد ليك حق التعديل في المونتاج والألوان في حدود المتفق عليه، أهم حاجة نطلع بنتيجة ترضيك." },
            { intent: "Booking", q: "أحجز موعد إزاي؟", a: "تقدر تدوس على زرار 'احجز الآن' في الموقع أو تكلمنا دايركت على الواتساب وهننسق معاك الموعد المناسب." }
        ];

        // 2. Filter out duplicates
        const newRecords = initialKnowledge
            .filter(k => !existingQuestions.includes(k.q))
            .map(k => ({
                intent: k.intent,
                question: k.q,
                answer: k.a,
                is_active: true
            }));

        if(newRecords.length > 0) {
            const { error } = await supabaseClient.from('faq_data').insert(newRecords);
            if(error) throw error;
        }

        // 3. Smart Logic: Solve Unanswered Questions
        await autoSolveUnanswered();
        
        showToast(`✓ تم تحديث البيانات وتنظيف الأسئلة المحلولة بنجاح!`);
        await init(); 
    } catch(err) { alert(err.message); }
};

// --- Terms and Conditions Management ---
window.addNewTermLine = (text = '') => {
    const container = document.getElementById('termsListContainer');
    if(!container) return;
    
    const div = document.createElement('div');
    div.className = 'term-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '8px';
    div.innerHTML = `
        <div style="flex: 1; position: relative;">
            <i class="fa-solid fa-circle-check" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--gold); font-size: 0.8rem; opacity: 0.5;"></i>
            <input type="text" class="term-row-input" value="${text}" placeholder="اكتب الشرط هنا..." style="padding-right: 40px !important; background: rgba(255,255,255,0.02) !important;">
        </div>
        <button type="button" class="btn-icon btn-icon-del" onclick="this.parentElement.remove()" style="width: 45px; height: 45px; flex-shrink: 0; border-radius: 12px;">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    container.appendChild(div);
};

// --- Smart Auto-Solver ---
async function autoSolveUnanswered() {
    try {
        const { data: unans } = await supabaseClient.from('chatbot_unanswered').select('*');
        const { data: faq } = await supabaseClient.from('faq_data').select('*');
        if(!unans || !faq) return;

        const solveIds = [];
        unans.forEach(u => {
            const uText = u.question.toLowerCase();
            // Check similarity with every question in FAQ
            const hasMatch = faq.some(f => calculateFuzzyScore(uText, f.question.toLowerCase()) > 0.45);
            if(hasMatch) solveIds.push(u.id);
        });

        if(solveIds.length > 0) {
            await supabaseClient.from('chatbot_unanswered').delete().in('id', solveIds);
            console.log(`Auto-solved ${solveIds.length} unanswered questions.`);
        }
    } catch(e) { console.error("Auto-solve failed", e); }
}

function calculateFuzzyScore(str1, str2) {
    const w1 = str1.split(/\s+/);
    const w2 = str2.split(/\s+/);
    const intersection = w1.filter(w => w2.includes(w));
    return intersection.length / Math.max(w1.length, w2.length);
}

let currentConvertId = null;

window.convertUnansweredToKB = (question, id) => {
    currentConvertId = id;
    openKBModal();
    setTimeout(() => {
        const f = document.getElementById('uniForm');
        if(f) {
            f.elements['question'].value = question;
            f.elements['intent'].value = 'Inquiry Conversion';
        }
    }, 150);
};

const renderUnanswered = () => {
    const list = document.getElementById('unansweredList');
    if(!list) return;
    list.innerHTML = unanswered.map(u => `
        <div class="item-card" style="border-color: rgba(255,50,50,0.2);">
            <div style="font-weight:900; color:#fff;">"${u.question}"</div>
            <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">المنشأ: ${u.lang === 'ar' ? 'العربية' : 'English'} | ${new Date(u.created_at).toLocaleDateString('ar-EG')}</div>
            <div class="item-actions">
                <button class="btn btn-sm" style="background:rgba(212,175,55,0.1); color:var(--gold); flex:1;" onclick="viewChatHistory(${u.id})"><i class="fa-solid fa-comments"></i> سياق المحادثة</button>
                <button class="btn btn-sm btn-gold" onclick="convertUnansweredToKB('${u.question.replace(/'/g, "\\'")}', ${u.id})"><i class="fa-solid fa-plus-circle"></i> تحويل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('chatbot_unanswered', ${u.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1; text-align:center; padding:40px; color:rgba(255,255,255,0.2);">رائع! لا توجد أسئلة لم يتم الرد عليها.</p>';
};

window.viewChatHistory = (id) => {
    console.log("Viewing chat history for ID:", id);
    const chat = unanswered.find(u => u.id == id);
    if(!chat) { alert("خطأ: لم يتم العثور على البيانات."); return; }
    
    let history = [];
    try {
        history = typeof chat.full_history === 'string' ? JSON.parse(chat.full_history) : (chat.full_history || []);
    } catch(e) { console.error("History Parse Error:", e); history = []; }

    if(!history || history.length === 0) { 
        alert("لا توجد تفاصيل محادثة مسجلة لهذا السؤال (ربما سُئل قبل تفعيل نظام التتبع)."); 
        return; 
    }
    
    const modal = document.getElementById('chatHistoryModal');
    const body = document.getElementById('chatHistoryBody');
    if(!modal || !body) { console.error("Modal elements missing!"); return; }

    body.innerHTML = history.map(m => `
        <div style="margin-bottom:15px; display:flex; flex-direction:column; align-items:${m.role==='user'?'flex-end':'flex-start'}">
            <div style="background:${m.role==='user'?'var(--gold)':'rgba(255,255,255,0.05)'}; 
                        color:${m.role==='user'?'#000':'#fff'};
                        padding:10px 15px; border-radius:15px; max-width:85%; font-size:0.85rem;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        border-bottom-${m.role==='user'?'right':'left'}-radius:2px;">
                <div style="font-weight:900; font-size:0.6rem; opacity:0.5; margin-bottom:5px; text-transform:uppercase;">${m.role==='user'?'عميل FrameZ':'مساعد الذكاء الاصطناعي'}</div>
                <div>${m.content}</div>
                ${m.media ? `<img src="${m.media}" style="width:100%; border-radius:10px; margin-top:10px; border: 1px solid rgba(255,255,255,0.1);">` : ''}
            </div>
            <span style="font-size:0.6rem; color:var(--text-dim); margin-top:5px; padding:0 5px;">${new Date(m.timestamp || new Date()).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
    `).join('');
    
    // Refresh visibility settings
    modal.classList.add('active');
};

window.closeChatHistory = () => {
    document.getElementById('chatHistoryModal').classList.remove('active');
};

// Auto Start
checkAuth();
