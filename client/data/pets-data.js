/**
 * Centralized Pet Data
 * Shared across all pages for consistency
 
curl -X POST http://localhost:8788/api/admin/pets \
  -H "Authorization: a1lQqh23fkfOVba43jpVwoi6lTskbc87mvE45Raw" \
  -H "Content-Type: application/json" \
  -d '{
        active: true,
        name: "Luna",
        type: "cat",
        breed: "Tekir",
        age: 2,
        ageGroup: "adult",
        size: "medium",
        gender: "female",
        description: "2 yaşında, sakin ve uysal bir kedi. Kucakta sevgi almayı çok seviyor ve apartman dairesine uygun. Çok temiz ve bakımlı, diğer kedilerle de iyi geçiniyor.\n\nLuna çok sevecen ve sadık bir karakter. İnsanlara karşı son derece dostane ve ailesiyle güçlü bağlar kuruyor.",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized"],
        urgent: false,
        dateAdded: "2025-01-20",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-building", text: "Apartman yaşamına uygun" },
            { icon: "fa-heart", text: "Çok sevecen ve uysal" },
            { icon: "fa-cat", text: "Diğer kedilerle uyumlu" }
        ],
        caretaker: {
            name: "Mehmet Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            phone: "+90 (258) 234 56 78",
            responseTime: "11:00-19:00",
            location: "Merkez, İzmir",
        }
    }'*/
const PETS_DATA = [
    {
        id: 1,
        name: "Pamuk",
        type: "dog",
        breed: "Golden Retriever",
        age: 3,
        ageGroup: "adult",
        size: "large",
        gender: "male",
        description: "3 yaşında, oyuncu ve çok sevecen bir Golden Retriever. Çocuklarla çok iyi anlaşıyor ve bahçeli evlerde mutlu olur. Günlük uzun yürüyüşlere ihtiyacı var ve sosyal bir hayvan olduğu için diğer köpeklerle de iyi geçiniyor.\n\nPamuk, önceki sahipleri tarafından terk edilmiş durumda. Çok sadık ve eğitimli bir köpek. Temel komutları biliyor ve ev kurallarına uygun. Aktif bir aile arıyor.",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized", "microchipped"],
        urgent: false,
        dateAdded: "2025-02-12",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-shield-alt", text: "Mükemmel bekçi köpeği" },
            { icon: "fa-graduation-cap", text: "Çok zeki ve eğitimli" },
            { icon: "fa-user-tie", text: "Deneyimli sahipler için" }
        ],
        caretaker: {
            name: "Oğuz Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 25,
            rating: 4.9,
            online: true,
            phone: "+90 (258) 901 23 45",
            responseTime: "Genellikle 2 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe, English, Deutsch"
        }
    },
    {
        id: 2,
        name: "Luna",
        type: "cat",
        breed: "Tekir",
        age: 2,
        ageGroup: "adult",
        size: "medium",
        gender: "female",
        description: "2 yaşında, sakin ve uysal bir kedi. Kucakta sevgi almayı çok seviyor ve apartman dairesine uygun. Çok temiz ve bakımlı, diğer kedilerle de iyi geçiniyor.\n\nLuna çok sevecen ve sadık bir karakter. İnsanlara karşı son derece dostane ve ailesiyle güçlü bağlar kuruyor.",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized"],
        urgent: false,
        dateAdded: "2025-01-20",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-building", text: "Apartman yaşamına uygun" },
            { icon: "fa-heart", text: "Çok sevecen ve uysal" },
            { icon: "fa-cat", text: "Diğer kedilerle uyumlu" }
        ],
        caretaker: {
            name: "Mehmet Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 8,
            rating: 4.9,
            online: false,
            phone: "+90 (258) 234 56 78",
            responseTime: "Genellikle 4 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 3,
        name: "Karamel",
        type: "dog",
        breed: "Sarman",
        age: 1,
        ageGroup: "young",
        size: "small",
        gender: "female",
        description: "1 yaşında, enerjik ve meraklı bir kedi. Yeni maceralara hazır küçük kaşif, genç sahipler için ideal. Çok oyuncu ve aktif, sürekli hareket halinde.\n\nKaramel çok zeki ve öğrenmeye açık. Oyuncaklarla oynamayı seviyor ve insanlarla etkileşim kurmaktan hoşlanıyor.",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated"],
        urgent: true,
        dateAdded: "2025-02-01",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-rocket", text: "Çok enerjik ve oyuncu" },
            { icon: "fa-user", text: "Genç sahipler için ideal" },
            { icon: "fa-puzzle-piece", text: "Zeka oyunlarını seviyor" }
        ],
        caretaker: {
            name: "Fatma Hanım",
            role: "Geçici Bakıcı",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 12,
            rating: 4.8,
            online: true,
            phone: "+90 (258) 345 67 89",
            responseTime: "Genellikle 1 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 4,
        name: "Max",
        type: "dog",
        breed: "Kangal Karması",
        age: 5,
        ageGroup: "adult",
        size: "large",
        gender: "male",
        description: "5 yaşında, sadık ve koruyucu bir köpek. Ailesine çok bağlı, bahçeli evler için uygun. Deneyimli köpek sahipleri arıyor.\n\nMax çok zeki ve eğitimli. Bekçilik yapmayı seviyor ancak saldırgan değil. Çocuklara karşı koruyucu ama nazik.",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized", "microchipped"],
        urgent: false,
        dateAdded: "2025-01-10",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-shield-alt", text: "Koruyucu ama nazik" },
            { icon: "fa-graduation-cap", text: "Deneyimli sahipler için" },
            { icon: "fa-home", text: "Bahçeli ev şart" }
        ],
        caretaker: {
            name: "Ali Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 22,
            rating: 4.9,
            online: false,
            phone: "+90 (258) 456 78 90",
            responseTime: "Genellikle 3 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe, English"
        }
    },
    {
        id: 5,
        name: "Minnak",
        type: "cat",
        breed: "Van Kedisi",
        age: 4,
        ageGroup: "adult",
        size: "medium",
        gender: "female",
        description: "4 yaşında, zarif ve sevecen bir Van kedisi. Sessiz ortamları seviyor, sakin aileler için uygun. Çok temiz ve bakımlı.\n\nMinnak çok nazik ve şefkatli. Sahibine çok bağlı ve sadık. Huzurlu bir ev ortamında mutlu olur.",
        image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized"],
        urgent: false,
        dateAdded: "2025-01-25",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-volume-down", text: "Sessiz ortam seviyor" },
            { icon: "fa-heart", text: "Çok sadık ve bağlı" },
            { icon: "fa-spa", text: "Sakin aileler için ideal" }
        ],
        caretaker: {
            name: "Zeynep Hanım",
            role: "Geçici Bakıcı",
            avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 9,
            rating: 5.0,
            online: true,
            phone: "+90 (258) 567 89 01",
            responseTime: "Genellikle 2 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 6,
        name: "Rocky",
        type: "dog",
        breed: "Pitbull Karması",
        age: 6,
        ageGroup: "adult",
        size: "medium",
        gender: "male",
        description: "6 yaşında, güçlü ve sadık bir köpek. Deneyimli köpek sahipleri için uygun, çok sevecen ve ailesine bağlı.\n\nRocky doğru eğitim verildiğinde mükemmel bir aile köpeği. Çok zeki ve öğrenmeye açık.",
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized", "microchipped"],
        urgent: false,
        dateAdded: "2025-02-05",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-graduation-cap", text: "Deneyimli sahipler için" },
            { icon: "fa-dumbbell", text: "Güçlü ve atletik" },
            { icon: "fa-brain", text: "Çok zeki ve öğrenken" }
        ],
        caretaker: {
            name: "Hasan Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 18,
            rating: 4.7,
            online: false,
            phone: "+90 (258) 678 90 12",
            responseTime: "Genellikle 4 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 7,
        name: "Pıtır",
        type: "cat",
        breed: "Siyah Kedi",
        age: 8,
        ageGroup: "senior",
        size: "small",
        gender: "male",
        description: "8 yaşında, yaşlı ama hala oyuncu bir kedi. Sakin bir yuva arıyor, çok akıllı ve uysal. Yaşlı kedilerin de sevgiye ihtiyacı var.\n\nPıtır çok deneyimli ve bilge bir kedi. Sakin ama sevecen, yaşlı sahipler için ideal.",
        image: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated"],
        urgent: true,
        dateAdded: "2025-01-30",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-heart", text: "Yaşlı ama çok sevecen" },
            { icon: "fa-user-friends", text: "Sakin aileler için" },
            { icon: "fa-brain", text: "Çok akıllı ve deneyimli" }
        ],
        caretaker: {
            name: "Emine Hanım",
            role: "Geçici Bakıcı",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 6,
            rating: 4.8,
            online: true,
            phone: "+90 (258) 789 01 23",
            responseTime: "Genellikle 1 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 8,
        name: "Bella",
        type: "dog",
        breed: "Labrador Karması",
        age: 2,
        ageGroup: "adult",
        size: "medium",
        gender: "female",
        description: "2 yaşında, çok enerjik ve oyuncu bir köpek. Çocukları seviyor, aktif aileler için perfect. Su oyunlarını çok seviyor.\n\nBella çok sosyal ve dostane. Diğer köpeklerle de iyi geçiniyor, park gezileri için ideal.",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized"],
        urgent: false,
        dateAdded: "2025-02-10",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-running", text: "Çok enerjik ve aktif" },
            { icon: "fa-child", text: "Çocuk dostu" },
            { icon: "fa-tint", text: "Su oyunlarını seviyor" }
        ],
        caretaker: {
            name: "Murat Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 13,
            rating: 4.6,
            online: false,
            phone: "+90 (258) 890 12 34",
            responseTime: "Genellikle 3 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe, English"
        }
    },
    {
        id: 9,
        name: "Simba",
        type: "dog",
        breed: "Alman Çoban Köpeği",
        age: 4,
        ageGroup: "adult",
        size: "large",
        gender: "male",
        description: "4 yaşında, çok zeki ve eğitimli bir Alman Çoban Köpeği. Bekçilik yapmayı seviyor, deneyimli aileler için uygun.\n\nSimba çok sadık ve koruyucu. Ailesine karşı çok bağlı, yabancılara karşı mesafeli ama saldırgan değil.",
        image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized", "microchipped"],
        urgent: false,
        dateAdded: "2025-01-15",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-home", text: "Bahçeli ev tercihi" },
            { icon: "fa-users", text: "Çocuklu aileler için uygun" },
            { icon: "fa-running", text: "Günlük egzersiz gerekir" }
        ],
        caretaker: {
            name: "Ayşe Hanım",
            role: "Geçici Bakıcı",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 15,
            rating: 5.0,
            online: true,
            phone: "+90 (258) 123 45 67",
            responseTime: "Genellikle 2 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe, English"
        }
    },
    {
        id: 10,
        name: "Prenses",
        type: "cat",
        breed: "Persian",
        age: 3,
        ageGroup: "adult",
        size: "small",
        gender: "female",
        description: "3 yaşında, çok nazik ve sessiz bir Persian kedisi. Lüks yaşam tarzına alışkın, özel bakım gerektirir. Çok güzel ve zarif.\n\nPrenses çok kibar ve asil. Sakin ortamları seviyor ve özel ilgi bekliyor.",
        image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "sterilized"],
        urgent: false,
        dateAdded: "2025-02-08",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-crown", text: "Özel bakım gerektirir" },
            { icon: "fa-gem", text: "Çok zarif ve güzel" },
            { icon: "fa-spa", text: "Lüks yaşam tarzına alışkın" }
        ],
        caretaker: {
            name: "Selin Hanım",
            role: "Uzman Bakıcı",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 7,
            rating: 5.0,
            online: false,
            phone: "+90 (258) 012 34 56",
            responseTime: "Genellikle 1 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe, English"
        }
    },
    {
        id: 11,
        name: "Çıtır",
        type: "cat",
        breed: "Sokak Kedisi",
        age: 6,
        ageGroup: "adult",
        size: "medium",
        gender: "male",
        description: "6 yaşında, çok uyumlu ve sakin bir sokak kedisi. Diğer hayvanlarla iyi geçinir, mükemmel ev kedisi. Çok temiz ve bakımlı.\n\nÇıtır çok uysal ve sevecen. Sokaktan geldiği halde çok kibar ve nazik davranıyor.",
        image: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated"],
        urgent: false,
        dateAdded: "2025-01-28",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-handshake", text: "Diğer hayvanlarla uyumlu" },
            { icon: "fa-home", text: "Mükemmel ev kedisi" },
            { icon: "fa-heart", text: "Çok uysal ve sevecen" }
        ],
        caretaker: {
            name: "Kemal Bey",
            role: "Gönüllü Bakıcı",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 11,
            rating: 4.7,
            online: true,
            phone: "+90 (258) 123 45 67",
            responseTime: "Genellikle 2 saat içinde",
            location: "Merkez, İzmir",
            languages: "Türkçe"
        }
    },
    {
        id: 12,
        name: "Buddy",
        type: "dog",
        breed: "Beagle",
        age: 1,
        ageGroup: "young",
        size: "medium",
        gender: "male",
        description: "1 yaşında, çok aktif ve meraklı bir Beagle. Koşmayı ve oynamayı seviyor, genç aileler için ideal. Çok sosyal ve dostane.\n\nBuddy çok enerjik ve öğrenmeye açık. Eğitim almaya hazır, sabırlı sahipler arıyor.",
        image: "https://images.unsplash.com/photo-1627961314162-74a0dd331871?q=80&w=987&auto=format&fit=crop&w=600&q=80",
        images: [
            "https://images.unsplash.com/photo-1627961314162-74a0dd331871?q=80&w=987&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        thumbnails: [
            "https://images.unsplash.com/photo-1627961314162-74a0dd331871?q=80&w=987&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
        ],
        health: ["vaccinated", "microchipped"],
        urgent: true,
        dateAdded: "2025-02-14",
        location: "İzmir",
        specialNotes: [
            { icon: "fa-rocket", text: "Çok enerjik ve aktif" },
            { icon: "fa-graduation-cap", text: "Eğitime açık" },
            { icon: "fa-users", text: "Genç aileler için ideal" }
        ],
        caretaker: {
            name: "Canan Hanım",
            role: "Geçici Bakıcı",
            avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            adoptions: 14,
            rating: 4.8,
            online: true,
            phone: "+90 (258) 234 56 78",
            responseTime: "Genellikle 1 saat içinde",
            location: "Pamukkale, İzmir",
            languages: "Türkçe, English"
        }
    },
];


  
    