import io
import os

filepath = r"c:\Users\hareedy mool\Desktop\freemz srudio\فرميز\index.html"
with open(filepath, "r", encoding="utf-8") as f:
    html = f.read()

# Make it LTR
html = html.replace('lang="ar" dir="rtl"', 'lang="en" dir="ltr"')

# Navbar
html = html.replace(">الرئيسية<", ">Home<")
html = html.replace(">أعمالنا<", ">Showreel<")
html = html.replace(">الخدمات<", ">Services<")
html = html.replace(">تواصل معنا<", ">Contact Us<")
html = html.replace(
    'href="en.html" class="lang-switch">EN', 'href="index.html" class="lang-switch">AR'
)

# Hero
html = html.replace("<span>لأن شغلك</span>", "<span>Because Your Work</span>")
html = html.replace(">يستاهل يبان صح<", ">Deserves to Look Right<")
html = html.replace(
    ">نحن في استوديو FrameZ لا نصنع الفيديوهات فحسب، بل نُترجم رؤيتك إلى واقع سينمائي يبهر العالم.<",
    ">At FrameZ Studio, we don't just make videos, we translate your vision into a cinematic reality that amazes the world.<",
)
html = html.replace(">إبدأ الآن | START RECORDING<", ">START RECORDING<")

# Catalog
html = html.replace(
    ">كـتـالـوج الـلـوكـيـشـنـات<", ' style="letter-spacing:0">LOCATION CATALOG<'
)
html = html.replace(
    ">استكشف مساحات التصوير الحصرية المجهزة بأعلى المعايير السينمائية لبناء عالمك الخاص.<",
    ">Explore our exclusive filming spaces equipped with the highest cinematic standards to build your own world.<",
)

html = html.replace(">مساحة البودكاست<", ">Podcast Space<")
html = html.replace(
    ">تجهيزات صوتية متكاملة، إضاءة دافئة دراماتيكية، وتعدد زوايا تصوير تلائم البرامج الحوارية والبودكاست.<",
    ">Integrated audio equipment, dramatic warm lighting, and multiple shooting angles suitable for talk shows and podcasts.<",
)

html = html.replace(">الصالون الفاخر<", ">Luxury Lounge<")
html = html.replace(
    ">ديكورات عصرية وتأسيس فاخر مخصص للمقابلات التلفزيونية وجلسات التصوير الدعائية (Editorials).<",
    ">Modern decor and luxurious furnishings dedicated to TV interviews and commercial photo shoots (Editorials).<",
)

html = html.replace(">الخلفية الخرافية (الكروما)<", ">VFX Green Screen<")
html = html.replace(
    ">شاشة خضراء ضخمة بحواف دائرية (Cyclorama) لدعم جميع أنواع الخدع البصرية الـ VFX.<",
    ">Massive curved green screen (Cyclorama) to support all kinds of visual effects (VFX).<",
)

html = html.replace(">ستوديو الإنتاج الضخم<", ">Max Production Studio<")
html = html.replace(
    ">مساحة صناعية ضخمة مجهزة لإعلانات السيارات وتصوير المنتجات الكبيرة مع سقف مدعم لحمل الإضاءات.<",
    ">Massive industrial space equipped for car commercials and large product shoots with a reinforced ceiling to carry lighting.<",
)

# Services
html = html.replace(">تصوير سينمائي<", ">Cinematography<")
html = html.replace(
    ">كاميرات 8K وإضاءة استوديو محترفة لتحقيق أعلى جودة بصرية لمحتواك.<",
    ">8K cameras and professional studio lighting to achieve the highest visual quality for your content.<",
)

html = html.replace(">بودكاست احترافي<", ">Professional Podcast<")
html = html.replace(
    ">تسجيل صوتي فائق النقاء مع إمكانية البث المباشر وتعدد الكاميرات.<",
    ">Ultra-pure audio recording with live streaming capabilities and multi-camera setups.<",
)

html = html.replace(">إنتاج وتلوين<", ">Production & Color Grading<")
html = html.replace(
    ">مونتاج احترافي وتصحيح ألوان (Color Grading) لإعطاء طابع سينمائي.<",
    ">Professional editing and color grading to give a cinematic feel.<",
)

# Change font direction fixes if needed.
# Let's align text properly for English
html = html.replace("text-align: right;", "text-align: left;")

outpath = r"c:\Users\hareedy mool\Desktop\freemz srudio\فرميز\en.html"
with open(outpath, "w", encoding="utf-8") as f:
    f.write(html)

print("Generated en.html successfully.")
