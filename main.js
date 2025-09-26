(function(){
// Simple language switching (TR <-> EN)
const texts = {
en:{
about:'About', adopt:'Adopt', articles:'Articles', contact:'Contact',
slogan:'Every paw deserves a home', subSlogan:'We help animals find loving families.',
ctaAdopt:'Adopt', ctaSignup:'Join Match List', readyToAdopt:'Ready to adopt',
view:'View', apply:'I want to adopt', signupTitle:'Join Match List', signupDesc:'Get notified when a pet fitting your criteria appears.',
missionTitle:'Our mission', missionText:'PatiYuva helps find permanent homes for shelter and street animals.' , howItWorks:'How it works', impact:'Impact', articlesTitle:'Articles & Resources', contactTitle:'Contact', join:'Join', clear:'Clear', privacy:'Privacy Policy', terms:'Terms'
},
tr:{
about:'Hakkımızda', adopt:'Sahiplendir', articles:'Makaleler', contact:'İletişim',
slogan:'Her patinin bir yuvası olmalı', subSlogan:'Sokakta ya da barınakta bekleyen dostlarımıza yeni bir hayat sunmak için buradayız.',
ctaAdopt:'Sahiplen', ctaSignup:'Eşleşme listesine katıl', readyToAdopt:'Sahiplenilmeyi Bekleyenler',
view:'İncele', apply:'Sahiplenmek istiyorum', signupTitle:'Eşleşme Listesine Katıl', signupDesc:'Size uygun bir hayvan bulunduğunda e-posta ile haberdar edileceksiniz.',
missionTitle:'Misyonumuz', missionText:'PatiYuva, sokakta ve barınaklarda yaşayan hayvanların sahiplendirilmelerine aracılık eder.', howItWorks:'Nasıl Çalışır?', impact:'Etkimiz', articlesTitle:'Makaleler & Kaynaklar', contactTitle:'İletişim', join:'Listeye Katıl', clear:'Temizle', privacy:'Gizlilik Politikası', terms:'Kullanım Şartları'
}
};


let currentLang = 'tr';
const toggle = document.getElementById('langToggle');
toggle.addEventListener('click', ()=>{
currentLang = currentLang === 'tr' ? 'en' : 'tr';
toggle.innerText = currentLang === 'tr' ? 'EN' : 'TR';
document.documentElement.lang = currentLang === 'tr' ? 'tr' : 'en';
// replace all [data-i18n]
document.querySelectorAll('[data-i18n]').forEach(el=>{
const key = el.getAttribute('data-i18n');
if(key && texts[currentLang][key]) el.innerText = texts[currentLang][key];
});
});


// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const navList = document.querySelector('.main-nav ul');
menuBtn && menuBtn.addEventListener('click', ()=>{
const open = navList.style.display === 'flex';
navList.style.display = open ? 'none' : 'flex';
menuBtn.setAttribute('aria-expanded', !open);
});


// Simple form handling: match form submission -> simulate server save
const matchForm = document.getElementById('matchForm');
matchForm && matchForm.addEventListener('submit', (e)=>{
e.preventDefault();
const data = {
name: document.getElementById('fullName').value.trim(),
email: document.getElementById('email').value.trim(),
species: document.getElementById('species').value,
notes: document.getElementById('notes').value.trim()
};
if(!data.name || !/\S+@\S+\.\S+/.test(data.email)){
alert('Lütfen ad ve geçerli e-posta girin.');
return;
}
// In production: send to backend endpoint with fetch() -> POST
console.log('Match signup', data);
alert('Teşekkürler! Tercihlerinize uygun hayvan bulunduğunda bilgilendirileceksiniz.');
matchForm.reset();
});


// Contact form
const contactForm = document.getElementById('contactForm');
contactForm && contactForm.addEventListener('submit', (e)=>{
e.preventDefault();
alert('Mesajınız alındı. En kısa sürede dönüş yapacağız.');
contactForm.reset();
});


// Pet card actions (view/adopt) - currently demo
document.querySelectorAll('[data-action]').forEach(btn=>{
btn.addEventListener('click', (ev)=>{
const action = btn.getAttribute('data-action');
const pet = btn.getAttribute('data-pet');
if(action === 'view'){
alert(pet + ' - Detaylar sayfası henüz aktif değil.');
} else if(action === 'adopt'){
alert('Sahiplenme başvurusu: ' + pet + '. Bizimle iletişime geçeceğiz.');
}
});
});


})();