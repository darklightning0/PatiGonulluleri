/**
 * Centralized Articles Data
 * Add sources array to each article with structure:
 * sources: [
 *   { title: "Source Name", url: "https://...", type: "website|academic|professional|legal" }
 * ]
 */

const ARTICLES_DATA = [
    {
        id: 1,
        title: {
            tr: "Yeni Sahiplenilen Kediler İçin İlk Hafta Rehberi",
            en: "First Week Guide for Newly Adopted Cats"
        },
        slug: "yeni-sahiplenilen-kediler-ilk-hafta-rehberi",
        summary: {
            tr: "Yeni evine gelen kedilerin adaptasyon sürecini kolaylaştırmak için yapmanız gerekenler. İlk günlerden itibaren doğru yaklaşım ile mutlu bir birlikteliğin temelleri.",
            en: "What you need to do to ease the adaptation process of cats coming to their new home. Building the foundations of a happy companionship with the right approach from the first days."
        },
        content: {
            tr: `<p>Yeni bir kediyi evinize aldığınızda, hem sizin hem de kedinin adaptasyon süreci başlar. Bu sürecin başarılı olması için sabırlı ve anlayışlı yaklaşımınız kritik önem taşır.</p>

<h2>İlk Gün: Güvenli Alan Oluşturma</h2>

<p>Kediler doğaları gereği temkinli hayvanlardır. Yeni bir ortamda kendilerini güvende hissetmeleri için zaman tanımak gerekir. İlk gün için evinizin sakin bir odasını seçin ve burayı kedinin ilk güvenli alanı yapın.</p>

<p>Bu odada bulunması gerekenler:</p>
<ul>
    <li>Temiz su ve mama kabı</li>
    <li>Kum kabı (mümkünse kullandığı marka kum)</li>
    <li>Rahat bir yatak</li>
    <li>Saklanabileceği bir alan (kutu, battaniye altı)</li>
    <li>Oyuncaklar</li>
</ul>

<h2>İlk Hafta: Sabırlı Yaklaşım</h2>

<p>Kediler stresli durumlarla farklı şekillerde başa çıkar. Bazıları hemen keşfe çıkarken, bazıları günlerce saklanabilir. Her kedinin temposu farklıdır ve buna saygı göstermek önemlidir.</p>

<h3>Günlük Rutin Oluşturun</h3>

<ul>
    <li>Aynı saatlerde beslenme</li>
    <li>Düzenli oyun seansları</li>
    <li>Sakin sesle konuşma</li>
    <li>Kedinin hızına göre ilerleme</li>
</ul>

<h2>Sağlık Kontrolleri</h2>

<p>Sahiplendirme sonrası ilk hafta içinde mutlaka veteriner kontrolü yaptırın. Bu kontrol hem kedinin sağlık durumunu öğrenmek hem de yakındaki veteriner hekimi tanımak için önemlidir.</p>

<h3>Kontrol Edilmesi Gerekenler:</h3>

<ul>
    <li>Genel sağlık durumu</li>
    <li>Parazit kontrolü</li>
    <li>Aşı durumu</li>
    <li>Kısırlaştırma planı</li>
    <li>Beslenme önerileri</li>
</ul>

<h2>Beslenme Alışkanlıkları</h2>

<p>Yeni sahiplenilen kedilerde beslenme sorunları sık yaşanır. Stres nedeniyle iştahsızlık normal bir durumdur ancak 2-3 günden fazla sürmesi durumunda veteriner hekim ile görüşün.</p>

<h3>Beslenme İpuçları:</h3>

<ul>
    <li>Önceki sahip/barınak ile aynı mama kullanın</li>
    <li>Mama değişikliğini kademeli yapın</li>
    <li>Her zaman temiz su bulundurun</li>
    <li>Sessiz bir köşede beslenme alanı oluşturun</li>
</ul>`,
            en: `<p>When you bring a new cat into your home, both you and the cat begin an adaptation process. Your patient and understanding approach is critically important for this process to be successful.</p>

<h2>First Day: Creating a Safe Space</h2>

<p>Cats are naturally cautious animals. They need time to feel safe in a new environment. Choose a quiet room in your house for the first day and make this the cat's first safe space.</p>

<p>What should be in this room:</p>
<ul>
    <li>Clean water and food bowls</li>
    <li>Litter box (preferably the same brand of litter they used)</li>
    <li>Comfortable bed</li>
    <li>Hiding place (box, under blanket)</li>
    <li>Toys</li>
</ul>

<h2>First Week: Patient Approach</h2>

<p>Cats cope with stressful situations in different ways. Some immediately start exploring, while others may hide for days. Each cat has its own pace and it's important to respect this.</p>

<h3>Create Daily Routine</h3>

<ul>
    <li>Feeding at the same times</li>
    <li>Regular play sessions</li>
    <li>Speaking in calm voice</li>
    <li>Progress at the cat's pace</li>
</ul>

<h2>Health Checkups</h2>

<p>Be sure to have a veterinary check-up within the first week after adoption. This check is important both to learn about the cat's health condition and to meet the nearby veterinarian.</p>

<h3>Things to Check:</h3>

<ul>
    <li>General health condition</li>
    <li>Parasite control</li>
    <li>Vaccination status</li>
    <li>Spaying/neutering plan</li>
    <li>Nutritional recommendations</li>
</ul>

<h2>Feeding Habits</h2>

<p>Feeding problems are common in newly adopted cats. Loss of appetite due to stress is normal, but consult a veterinarian if it lasts more than 2-3 days.</p>

<h3>Feeding Tips:</h3>

<ul>
    <li>Use the same food as previous owner/shelter</li>
    <li>Make food changes gradually</li>
    <li>Always provide clean water</li>
    <li>Create feeding area in quiet corner</li>
</ul>`
        },
        image: "assets/articles/article_1.jpg",
        author: {
            name: "Dr. Ayşe Kaya",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Veteriner Hekim ve Hayvan Davranış Uzmanı",
                en: "Veterinarian and Animal Behavior Specialist"
            },
            credentials: {
                tr: "İstanbul Üniversitesi Veteriner Fakültesi mezunu, 8 yıl klinik deneyim",
                en: "Graduate of Istanbul University Veterinary Faculty, 8 years of clinical experience"
            },
            social: {
                linkedin: "https://linkedin.com/in/ayse-kaya-vet",
                twitter: "https://twitter.com/ayse_kaya_vet"
            }
        },
        category: {
            tr: "Sahiplendirme Rehberleri",
            en: "Adoption Guides"
        },
        tags: [
            { tr: "kedi", en: "cat" },
            { tr: "sahiplendirme", en: "adoption" },
            { tr: "bakım", en: "care" },
            { tr: "adaptasyon", en: "adaptation" }
        ],
        publishDate: "2025-01-15",
        lastUpdated: "2025-01-20",
        readingTime: 8,
        views: 1247,
        featured: true,
        urgent: false,
        sources: [
            {
                title: "ASPCA Pet Care Guidelines",
                url: "https://www.aspca.org/pet-care",
                type: "website"
            },
            {
                title: "Journal of Feline Medicine and Surgery",
                url: "https://journals.sagepub.com/home/jfm",
                type: "academic"
            },
            {
                title: "Veteriner Hekimler Odası Rehberi",
                url: "https://vho.org.tr",
                type: "professional"
            }
        ],
    },
    {
        id: 2,
        title: {
            tr: "Sokak Hayvanlarına Nasıl Yardım Edebiliriz?",
            en: "How Can We Help Street Animals?"
        },
        slug: "sokak-hayvanlarina-nasil-yardim-edebiliriz",
        summary: {
            tr: "Sokakta yaşayan hayvan dostlarımızın hayatlarını kolaylaştırmak için her birimizin yapabileceği basit ama etkili yöntemler.",
            en: "Simple but effective ways each of us can make life easier for our animal friends living on the streets."
        },
        content: {
            tr: `<p>Sokak hayvanlarına yardım etmek için büyük bütçelere ihtiyacınız yok. Küçük jestların bile büyük fark yaratabileceği bu konuda herkesin yapabileceği önemli katkılar var.</p>

<h2>Temel İhtiyaçları Karşılama</h2>

<h3>Su ve Beslenme</h3>

<p>Sokak hayvanlarının en temel ihtiyacı temiz su ve besindir. Özellikle yaz aylarında su ihtiyacı kritik düzeye çıkar.</p>

<p><strong>Yapabilecekleriniz:</strong></p>
<ul>
    <li>Evinizin giriş yerine temiz su kabı koyun</li>
    <li>Düzenli olarak mama bırakın</li>
    <li>Kış aylarında sıcak yemek tercih edin</li>
    <li>Su kaplarını düzenli olarak temizleyin</li>
</ul>

<h2>Sağlık ve Bakım Desteği</h2>

<h3>Veteriner Yardımı</h3>

<p>Yaralı veya hasta hayvanlar gördüğünüzde hemen harekete geçin.</p>

<p><strong>Acil Durum Adımları:</strong></p>
<ol>
    <li>Hayvanın durumunu fotoğraflayın</li>
    <li>En yakın veteriner ile iletişime geçin</li>
    <li>Hayvan derneği veya belediyeyi arayın</li>
    <li>Sosyal medyadan destek isteyin</li>
</ol>`,
            en: `<p>You don't need large budgets to help street animals. There are significant contributions everyone can make in this area where even small gestures can make a big difference.</p>

<h2>Meeting Basic Needs</h2>

<h3>Water and Feeding</h3>

<p>The most basic need of street animals is clean water and food. Especially in summer months, water need reaches critical levels.</p>

<p><strong>What You Can Do:</strong></p>
<ul>
    <li>Place clean water bowls at your entrance</li>
    <li>Leave food regularly</li>
    <li>Prefer warm food in winter months</li>
                <li>Clean water bowls regularly</li>
</ul>

<h2>Health and Care Support</h2>

<h3>Veterinary Help</h3>

<p>Take immediate action when you see injured or sick animals.</p>

<p><strong>Emergency Steps:</strong></p>
<ol>
    <li>Take photos of the animal's condition</li>
    <li>Contact the nearest veterinarian</li>
    <li>Call animal association or municipality</li>
    <li>Ask for support on social media</li>
</ol>`
        },
        image: "assets/articles/article_2.jpg",
        author: {
            name: "Mehmet Özkan",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Gönüllü Koordinatörü",
                en: "Volunteer Coordinator"
            },
            credentials: {
                tr: "5 yıl hayvan hakları aktivisti, 15+ barınak projesi koordinatörü",
                en: "5 years animal rights activist, 15+ shelter project coordinator"
            },
            social: {
                twitter: "https://twitter.com/mehmet_ozkan_vol"
            }
        },
        category: {
            tr: "Toplumsal Farkındalık",
            en: "Social Awareness"
        },
        tags: [
            { tr: "sokak hayvanları", en: "street animals" },
            { tr: "yardım", en: "help" },
            { tr: "besleme", en: "feeding" },
            { tr: "farkındalık", en: "awareness" }
        ],
        publishDate: "2025-01-10",
        lastUpdated: "2025-01-12",
        readingTime: 6,
        views: 892,
        featured: true,
        urgent: false,
        sources: [
            {
                title: "World Animal Protection Guidelines",
                url: "https://www.worldanimalprotection.org",
                type: "website"
            },
            {
                title: "Belediye Sokak Hayvanları Yönetmeliği",
                url: "https://mevzuat.gov.tr",
                type: "legal"
            }
        ],
    },
            {
        id: 3,
        title: {
            tr: "Köpeklerde Aşı Takvimi ve Önemi",
            en: "Vaccination Schedule and Importance for Dogs"
        },
        slug: "kopeklerde-asi-takvimi-ve-onemi",
        summary: {
            tr: "Köpeklerin sağlıklı bir yaşam sürdürebilmesi için gerekli aşılar ve uygulama zamanları.",
            en: "Essential vaccines and their schedule to ensure dogs live a healthy life."
        },
        content: {
            tr: `<p>Köpeklerde aşılar, bulaşıcı ve ölümcül hastalıklara karşı en etkili koruma yöntemidir. Düzenli bir aşı takvimi, uzun ve sağlıklı bir yaşamın anahtarıdır.</p>
<h2>Zorunlu Aşılar</h2>
<ul>
<li>Kuduz</li>
<li>Karma (Distemper, Parvovirus, Hepatitis, Parainfluenza)</li>
<li>Bronşin (Kennel Cough)</li>
</ul>
<h2>Aşı Programı</h2>
<p>Yavru köpeklerde 6-8 haftalıktan itibaren başlanmalı ve veterinerin önerisine göre tamamlanmalıdır.</p>`,
            en: `<p>Vaccines are the most effective protection against infectious and deadly diseases in dogs. A proper vaccination schedule is the key to a long and healthy life.</p>
<h2>Core Vaccines</h2>
<ul>
<li>Rabies</li>
<li>Combination (Distemper, Parvovirus, Hepatitis, Parainfluenza)</li>
<li>Bordetella (Kennel Cough)</li>
</ul>
<h2>Schedule</h2>
<p>Puppies should begin vaccinations from 6–8 weeks of age and complete them according to veterinary advice.</p>`
        },
        image: "assets/articles/article_3.jpg",
        author: {
            name: "Dr. Selin Demir",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Veteriner Hekim",
                en: "Veterinarian"
            },
            credentials: {
                tr: "Ankara Üniversitesi Veteriner Fakültesi, 12 yıl deneyim",
                en: "Ankara University Veterinary Faculty, 12 years experience"
            },
            social: {
                linkedin: "https://linkedin.com/in/selin-demir-vet"
            }
        },
        category: {
            tr: "Sağlık ve Tıp",
            en: "Health and Medicine"
        },
        tags: [
            { tr: "köpek", en: "dog" },
            { tr: "aşı", en: "vaccine" },
            { tr: "sağlık", en: "health" }
        ],
        publishDate: "2025-02-01",
        lastUpdated: "2025-02-05",
        readingTime: 7,
        views: 673,
        featured: false,
        urgent: true,
        sources: [
            {
                title: "World Small Animal Veterinary Association (WSAVA) Vaccination Guidelines",
                url: "https://wsava.org",
                type: "professional"
            },
            {
                title: "American Veterinary Medical Association (AVMA)",
                url: "https://www.avma.org",
                type: "website"
            }
        ],
    },
    {
        id: 4,
        title: {
            tr: "Kedilerde Oyun ve Zihinsel Gelişim",
            en: "Play and Mental Development in Cats"
        },
        slug: "kedilerde-oyun-ve-zihinsel-gelisim",
        summary: {
            tr: "Kedinizin zihinsel sağlığını ve davranış gelişimini desteklemenin yolları.",
            en: "Ways to support your cat's mental health and behavioral development."
        },
        content: {
            tr: `<p>Kediler yalnızca fiziksel değil zihinsel aktivitelere de ihtiyaç duyar. Oyun, kedinizin sağlıklı ve mutlu olmasını sağlar.</p>
<h2>Oyun Türleri</h2>
<ul>
<li>Av taklidi oyunlar</li>
<li>Zeka oyuncakları</li>
<li>Tırmanma ve keşif alanları</li>
</ul>`,
            en: `<p>Cats need not only physical but also mental stimulation. Play keeps your cat healthy and happy.</p>
<h2>Types of Play</h2>
<ul>
<li>Hunting simulation games</li>
<li>Puzzle toys</li>
<li>Climbing and exploration areas</li>
</ul>`
        },
        image: "assets/articles/article_4.jpg",
        author: {
            name: "Zeynep Karaca",
            avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Hayvan Davranış Danışmanı",
                en: "Animal Behavior Consultant"
            },
            credentials: {
                tr: "Davranış terapisi eğitimi, 6 yıl deneyim",
                en: "Behavior therapy training, 6 years experience"
            },
            social: {
                twitter: "https://twitter.com/zeynep_karaca_ab"
            }
        },
        category: {
            tr: "Eğitim ve Davranış",
            en: "Training and Behavior"
        },
        tags: [
            { tr: "kedi", en: "cat" },
            { tr: "oyun", en: "play" },
            { tr: "davranış", en: "behavior" }
        ],
        publishDate: "2025-02-10",
        lastUpdated: "2025-02-12",
        readingTime: 5,
        views: 341,
        featured: false,
        urgent: false,
        sources: [
            {
                title: "International Cat Care - Environmental Enrichment",
                url: "https://icatcare.org",
                type: "website"
            },
            {
                title: "Journal of Veterinary Behavior",
                url: "https://www.journals.elsevier.com/journal-of-veterinary-behavior",
                type: "academic"
            }
        ],
    },
    {
        id: 5,
        title: {
            tr: "Kış Aylarında Sokak Hayvanlarına Yardım",
            en: "Helping Street Animals in Winter"
        },
        slug: "kis-aylarinda-sokak-hayvanlarina-yardim",
        summary: {
            tr: "Soğuk havalarda sokak hayvanlarının hayatta kalmasına yardımcı olacak yöntemler.",
            en: "Methods to help street animals survive during cold weather."
        },
        content: {
            tr: `<p>Kış aylarında sokak hayvanları yiyecek ve barınma konusunda büyük zorluk yaşar. Basit adımlarla onların hayatlarını kolaylaştırabilirsiniz.</p>
<h2>Pratik Öneriler</h2>
<ul>
<li>Kapalı kutulardan barınak yapın</li>
<li>Sıcak su torbaları ile destek olun</li>
<li>Dondurucu havalarda protein açısından zengin besinler sağlayın</li>
</ul>`,
            en: `<p>During winter, street animals face major difficulties with food and shelter. With simple steps, you can make their lives easier.</p>
<h2>Practical Tips</h2>
<ul>
<li>Create shelters from closed boxes</li>
<li>Provide warmth with hot water bottles</li>
<li>Offer protein-rich food during freezing weather</li>
</ul>`
        },
        image: "assets/articles/article_5.jpg",
        author: {
            name: "Ahmet Yıldız",
            avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Hayvansever Gönüllü",
                en: "Animal Lover Volunteer"
            },
            credentials: {
                tr: "Yerel dernek gönüllüsü, 10 yıl deneyim",
                en: "Local NGO volunteer, 10 years experience"
            },
            social: {
                instagram: "https://instagram.com/ahmet_yildiz_animalcare"
            }
        },
        category: {
            tr: "Mevsimsel Bakım",
            en: "Seasonal Care"
        },
        tags: [
            { tr: "sokak hayvanları", en: "street animals" },
            { tr: "kış", en: "winter" },
            { tr: "yardım", en: "help" }
        ],
        publishDate: "2025-01-25",
        lastUpdated: "2025-01-28",
        readingTime: 4,
        views: 512,
        featured: true,
        urgent: true,
        sources: [
            {
                title: "Humane Society - Winter Pet Care Tips",
                url: "https://www.humanesociety.org",
                type: "website"
            }
        ],
    },
    {
        id: 6,
        title: {
            tr: "Engelli Evcil Hayvanların Bakımı",
            en: "Caring for Disabled Pets"
        },
        slug: "engelli-evcil-hayvanlarin-bakimi",
        summary: {
            tr: "Özel ihtiyaçları olan evcil dostlarımız için bakım önerileri.",
            en: "Care recommendations for pets with special needs."
        },
        content: {
            tr: `<p>Engelli evcil hayvanlar da diğerleri gibi sevgiye ve bakıma ihtiyaç duyar. Doğru yöntemlerle onların yaşam kalitesini artırabilirsiniz.</p>
<h2>Bakım İpuçları</h2>
<ul>
<li>Kaymaz zeminler tercih edin</li>
<li>Özel taşıma aparatları kullanın</li>
<li>Düzenli veteriner kontrollerini ihmal etmeyin</li>
</ul>`,
            en: `<p>Disabled pets also need love and care just like others. With the right methods, you can improve their quality of life.</p>
<h2>Care Tips</h2>
<ul>
<li>Prefer non-slip floors</li>
<li>Use special mobility aids</li>
<li>Don’t skip regular veterinary check-ups</li>
</ul>`
        },
        image: "assets/articles/article_6.jpg",
        author: {
            name: "Elif Arslan",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Veteriner Teknikeri",
                en: "Veterinary Technician"
            },
            credentials: {
                tr: "8 yıl klinik deneyim",
                en: "8 years of clinical experience"
            },
            social: {
                linkedin: "https://linkedin.com/in/elif-arslan-vettech"
            }
        },
        category: {
            tr: "Özel Durumlar",
            en: "Special Conditions"
        },
        tags: [
            { tr: "engelli hayvan", en: "disabled pet" },
            { tr: "bakım", en: "care" },
            { tr: "rehber", en: "guide" }
        ],
        publishDate: "2025-02-15",
        lastUpdated: "2025-02-17",
        readingTime: 6,
        views: 278,
        featured: false,
        urgent: false,
        sources: [
            {
                title: "PetMD - Caring for Disabled Pets",
                url: "https://www.petmd.com",
                type: "website"
            }
        ],
    },
        {
        id: 7,
        title: {
            tr: "Hayvan Barınaklarında Gönüllü Olmanın Önemi",
            en: "The Importance of Volunteering at Animal Shelters"
        },
        slug: "hayvan-barinaklarinda-gonullu-olmanin-onemi",
        summary: {
            tr: "Barınaklarda gönüllü olarak çalışmanın hem hayvanlara hem de gönüllülere kazandırdıkları.",
            en: "How volunteering at shelters benefits both animals and volunteers."
        },
        content: {
            tr: `<p>Barınaklarda gönüllü olmak sadece hayvanlara yardım etmek değil, aynı zamanda toplumda farkındalık yaratmanın da bir yoludur.</p>
<h2>Katkılarınız</h2>
<ul>
<li>Beslenme ve temizlik desteği</li>
<li>Hayvanlarla sosyalleşme ve oyun</li>
<li>Adopisyon süreçlerine destek</li>
</ul>`,
            en: `<p>Volunteering at shelters is not only about helping animals but also a way to raise awareness in society.</p>
<h2>Your Contributions</h2>
<ul>
<li>Support with feeding and cleaning</li>
<li>Socializing and playing with animals</li>
<li>Assisting in adoption processes</li>
</ul>`
        },
        image: "assets/articles/article_7.jpg",
        author: {
            name: "Cemal Ergin",
            avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Hayvan Hakları Derneği Gönüllü Lideri",
                en: "Animal Rights Association Volunteer Leader"
            },
            credentials: {
                tr: "15 yıl gönüllülük, 50+ barınak projesi",
                en: "15 years of volunteering, 50+ shelter projects"
            },
            social: {
                facebook: "https://facebook.com/cemalergin.volunteer"
            }
        },
        category: {
            tr: "Gönüllülük",
            en: "Volunteering"
        },
        tags: [
            { tr: "barınak", en: "shelter" },
            { tr: "gönüllü", en: "volunteer" },
            { tr: "yardım", en: "help" }
        ],
        publishDate: "2025-02-20",
        lastUpdated: "2025-02-21",
        readingTime: 6,
        views: 436,
        featured: false,
        urgent: false,
        sources: [
            {
                title: "Best Friends Animal Society - Volunteer Programs",
                url: "https://bestfriends.org",
                type: "website"
            }
        ],
    },
    {
        id: 8,
        title: {
            tr: "Evcil Hayvanlarla Küçük Evlerde Yaşam",
            en: "Living with Pets in Small Homes"
        },
        slug: "evcil-hayvanlarla-kucuk-evlerde-yasam",
        summary: {
            tr: "Dar yaşam alanlarında evcil hayvanlar için pratik çözümler.",
            en: "Practical solutions for living with pets in compact living spaces."
        },
        content: {
            tr: `<p>Küçük evlerde evcil hayvanlarla yaşamak bazı zorluklar getirir. Ancak doğru düzenlemelerle hem sizin hem de hayvanınızın konforunu artırabilirsiniz.</p>
<h2>İpuçları</h2>
<ul>
<li>Modüler mobilya ve tırmanma alanları</li>
<li>Düzenli oyun seansları</li>
<li>Sessiz dinlenme köşeleri oluşturma</li>
</ul>`,
            en: `<p>Living with pets in small homes can be challenging, but with proper arrangements, you can increase comfort for both you and your pet.</p>
<h2>Tips</h2>
<ul>
<li>Use modular furniture and climbing spaces</li>
<li>Schedule regular play sessions</li>
<li>Create quiet resting corners</li>
</ul>`
        },
        image: "assets/articles/article_8.jpg",
        author: {
            name: "Merve Kalkan",
            avatar: "https://images.unsplash.com/photo-1531256379411-56c5d6f35f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "İç Mimar ve Hayvansever",
                en: "Interior Designer and Animal Lover"
            },
            credentials: {
                tr: "Evcil hayvan dostu yaşam alanı tasarımları",
                en: "Pet-friendly living space designs"
            },
            social: {
                instagram: "https://instagram.com/merve_kalkan_design"
            }
        },
        category: {
            tr: "Yaşam Alanları",
            en: "Living Spaces"
        },
        tags: [
            { tr: "yaşam alanı", en: "living space" },
            { tr: "evcil hayvan", en: "pet" },
            { tr: "küçük ev", en: "small home" }
        ],
        publishDate: "2025-02-22",
        lastUpdated: "2025-02-24",
        readingTime: 5,
        views: 298,
        featured: true,
        urgent: false,
        sources: [
            {
                title: "Apartment Therapy - Pets in Small Spaces",
                url: "https://www.apartmenttherapy.com",
                type: "website"
            }
        ],
    },
    {
        id: 9,
        title: {
            tr: "Köpeklerde Temel Eğitim Komutları",
            en: "Basic Training Commands for Dogs"
        },
        slug: "kopeklerde-temel-egitim-komutlari",
        summary: {
            tr: "Köpeğinizin öğrenmesi gereken temel komutlar ve öğretme yöntemleri.",
            en: "Essential commands your dog should learn and how to teach them."
        },
        content: {
            tr: `<p>Temel komutlar köpeklerle uyumlu bir yaşam için şarttır. Pozitif pekiştirme ile köpeğiniz kısa sürede öğrenebilir.</p>
<h2>Öğretilecek Komutlar</h2>
<ul>
<li>Otur</li>
<li>Bekle</li>
<li>Gel</li>
<li>Hayır</li>
</ul>`,
            en: `<p>Basic commands are essential for a harmonious life with your dog. With positive reinforcement, your dog can learn quickly.</p>
<h2>Commands to Teach</h2>
<ul>
<li>Sit</li>
<li>Stay</li>
<li>Come</li>
<li>No</li>
</ul>`
        },
        image: "assets/articles/article_9.jpg",
        author: {
            name: "Okan Tunç",
            avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Köpek Eğitmeni",
                en: "Dog Trainer"
            },
            credentials: {
                tr: "Uluslararası sertifikalı köpek eğitmeni, 9 yıl deneyim",
                en: "Internationally certified dog trainer, 9 years experience"
            },
            social: {
                linkedin: "https://linkedin.com/in/okan-tunc-dogtrainer"
            }
        },
        category: {
            tr: "Eğitim ve Davranış",
            en: "Training and Behavior"
        },
        tags: [
            { tr: "köpek", en: "dog" },
            { tr: "eğitim", en: "training" },
            { tr: "komut", en: "command" }
        ],
        publishDate: "2025-02-25",
        lastUpdated: "2025-02-26",
        readingTime: 7,
        views: 421,
        featured: false,
        urgent: false,
        sources: [
            {
                title: "American Kennel Club - Dog Training Basics",
                url: "https://www.akc.org",
                type: "website"
            }
        ],
    },
    {
        id: 10,
        title: {
            tr: "Evcil Hayvanlarda İlk Yardım Rehberi",
            en: "First Aid Guide for Pets"
        },
        slug: "evcil-hayvanlarda-ilk-yardim-rehberi",
        summary: {
            tr: "Acil durumlarda evcil hayvanınıza nasıl ilk yardım uygulayabileceğinizi öğrenin.",
            en: "Learn how to provide first aid to your pet in emergencies."
        },
        content: {
            tr: `<p>Acil durumlarda ilk yardım hayat kurtarabilir. Veteriner gelene kadar yapılacak doğru müdahale önemlidir.</p>
<h2>Önemli Noktalar</h2>
<ul>
<li>Kanama kontrolü</li>
<li>Zehirlenme belirtileri</li>
<li>Temel kalp masajı</li>
<li>Yara temizliği</li>
</ul>`,
            en: `<p>First aid can save lives in emergencies. Proper intervention until the vet arrives is crucial.</p>
<h2>Key Points</h2>
<ul>
<li>Controlling bleeding</li>
<li>Recognizing poisoning symptoms</li>
<li>Basic CPR</li>
<li>Cleaning wounds</li>
</ul>`
        },
        image: "assets/articles/article_10.jpg",
        author: {
            name: "Dr. Hakan Yılmaz",
            avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Acil Veteriner Hekimi",
                en: "Emergency Veterinarian"
            },
            credentials: {
                tr: "Acil kliniklerde 10+ yıl deneyim",
                en: "10+ years experience in emergency clinics"
            },
            social: {
                twitter: "https://twitter.com/drhakanyilmaz"
            }
        },
        category: {
            tr: "Praktik Bilgiler",
            en: "Practical Information"
        },
        tags: [
            { tr: "ilk yardım", en: "first aid" },
            { tr: "acil", en: "emergency" },
            { tr: "sağlık", en: "health" }
        ],
        publishDate: "2025-02-28",
        lastUpdated: "2025-03-01",
        readingTime: 8,
        views: 519,
        featured: true,
        urgent: true,
        sources: [
            {
                title: "Red Cross - Pet First Aid",
                url: "https://www.redcross.org/take-a-class/first-aid/pet-first-aid",
                type: "website"
            },
            {
                title: "Merck Veterinary Manual",
                url: "https://www.merckvetmanual.com",
                type: "academic"
            }
        ],
    },



    // Add more articles following the same pattern...
    // Articles 3-10 with similar structure
];

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARTICLES_DATA;
}