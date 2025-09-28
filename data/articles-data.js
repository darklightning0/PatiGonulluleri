/**
 * Centralized Articles Data
 * Shared across all article-related pages for consistency
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
            tr: "Yeni bir kediyi evinize aldığınızda, hem sizin hem de kedinin adaptasyon süreci başlar...",
            en: "When you bring a new cat into your home, both you and the cat begin an adaptation process..."
        },
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Dr. Ayşe Kaya",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Veteriner Hekim ve Hayvan Davranış Uzmanı",
                en: "Veterinarian and Animal Behavior Specialist"
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
            tr: "Sokak hayvanlarına yardım etmek için büyük bütçelere ihtiyacınız yok...",
            en: "You don't need large budgets to help street animals..."
        },
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Mehmet Özkan",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Gönüllü Koordinatörü",
                en: "Volunteer Coordinator"
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
    },
    {
        id: 3,
        title: {
            tr: "Köpek Sahiplendirmede Dikkat Edilmesi Gerekenler",
            en: "Things to Consider in Dog Adoption"
        },
        slug: "kopek-sahiplendirmede-dikkat-edilmesi-gerekenler",
        summary: {
            tr: "Köpek sahiplendirme kararı vermeden önce bilmeniz gereken önemli faktörler ve uzun vadeli sorumluluklar hakkında kapsamlı bilgiler.",
            en: "Comprehensive information about important factors and long-term responsibilities you need to know before deciding to adopt a dog."
        },
        content: {
            tr: "Köpek sahiplendirmek 10-15 yıllık bir sorumluluk gerektiren önemli bir karardır...",
            en: "Dog adoption is an important decision that requires 10-15 years of responsibility..."
        },
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Can Demir",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Köpek Eğitmeni ve Davranış Uzmanı",
                en: "Dog Trainer and Behavior Specialist"
            }
        },
        category: {
            tr: "Sahiplendirme Rehberleri",
            en: "Adoption Guides"
        },
        tags: [
            { tr: "köpek", en: "dog" },
            { tr: "sahiplendirme", en: "adoption" },
            { tr: "eğitim", en: "training" },
            { tr: "sorumluluk", en: "responsibility" }
        ],
        publishDate: "2025-01-08",
        lastUpdated: "2025-01-09",
        readingTime: 12,
        views: 756,
        featured: false,
    },
    {
        id: 4,
        title: {
            tr: "Hayvan Bakım Maliyetleri ve Bütçe Planlaması",
            en: "Animal Care Costs and Budget Planning"
        },
        slug: "hayvan-bakim-maliyetleri-ve-butce-planlamasi",
        summary: {
            tr: "Pet sahipliğinin gerektirdiği mali yükümlülükler ve akıllı bütçe planlaması ile masrafları nasıl yönetebileceğiniz konusunda pratik öneriler.",
            en: "Practical suggestions on the financial obligations of pet ownership and how to manage expenses with smart budget planning."
        },
        content: {
            tr: "Hayvan sahipliği sadece sevgi ve ilgi değil, aynı zamanda finansal bir sorumluluktur...",
            en: "Pet ownership is not just love and care, but also a financial responsibility..."
        },
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Fatma Yılmaz",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Mali Müşavir ve Gönüllü",
                en: "Financial Advisor and Volunteer"
            }
        },
        category: {
            tr: "Pratik Bilgiler",
            en: "Practical Information"
        },
        tags: [
            { tr: "maliyet", en: "cost" },
            { tr: "bütçe", en: "budget" },
            { tr: "veteriner", en: "veterinary" },
            { tr: "planlama", en: "planning" }
        ],
        publishDate: "2025-01-05",
        lastUpdated: "2025-01-07",
        readingTime: 10,
        views: 634,
        featured: false,
    },
    {
        id: 5,
        title: {
            tr: "Kış Aylarında Sokak Hayvanları İçin Neler Yapabiliriz?",
            en: "What Can We Do for Street Animals in Winter?"
        },
        slug: "kis-aylarinda-sokak-hayvanlari-icin-neler-yapabiliriz",
        summary: {
            tr: "Soğuk kış günlerinde sokakta yaşayan hayvan dostlarımızın hayatta kalma mücadelesine destek olmak için alabileceğimiz önlemler ve yapabileceğimiz yardımlar.",
            en: "Measures we can take and help we can provide to support our animal friends living on the streets in their survival struggle during cold winter days."
        },
        content: {
            tr: "Kış mevsimi sokak hayvanları için en zor dönemlerden biridir...",
            en: "Winter is one of the most difficult periods for street animals..."
        },
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Ahmet Kılıç",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Veteriner Teknisyeni",
                en: "Veterinary Technician"
            }
        },
        category: {
            tr: "Mevsimsel Bakım",
            en: "Seasonal Care"
        },
        tags: [
            { tr: "kış bakımı", en: "winter care" },
            { tr: "sokak hayvanları", en: "street animals" },
            { tr: "barınma", en: "shelter" },
            { tr: "beslenme", en: "feeding" }
        ],
        publishDate: "2024-12-28",
        lastUpdated: "2025-01-02",
        readingTime: 7,
        views: 1123,
        featured: true,
    },
    {
        id: 6,
        title: {
            tr: "Yaşlı Hayvanların Sahiplendirilmesi ve Özel Bakım Gereksinimleri",
            en: "Adoption of Senior Animals and Special Care Requirements"
        },
        slug: "yasli-hayvanlarin-sahiplendirilmesi-ve-ozel-bakim-gereksinimleri",
        summary: {
            tr: "7 yaş üstü hayvanların sahiplendirme süreci, özel ihtiyaçları ve yaşlı bir dostun hayatınıza katacağı değerler hakkında bilmeniz gerekenler.",
            en: "What you need to know about the adoption process of animals over 7 years old, their special needs and the values a senior friend will add to your life."
        },
        content: {
            tr: "Yaşlı hayvanlar sahiplendirmede genellikle gözden kaçırılır...",
            en: "Senior animals are often overlooked in adoption..."
        },
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Dr. Selma Çelik",
            avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Geriatrik Veteriner Uzmanı",
                en: "Geriatric Veterinary Specialist"
            }
        },
        category: {
            tr: "Özel Durumlar",
            en: "Special Cases"
        },
        tags: [
            { tr: "yaşlı hayvanlar", en: "senior animals" },
            { tr: "özel bakım", en: "special care" },
            { tr: "sağlık", en: "health" },
            { tr: "sahiplendirme", en: "adoption" }
        ],
        publishDate: "2024-12-25",
        lastUpdated: "2024-12-27",
        readingTime: 9,
        views: 445,
        featured: false,
    },
    {
        id: 7,
        title: {
            tr: "Ev Hayvanlarının Sosyalizasyon Süreci",
            en: "Socialization Process of Pets"
        },
        slug: "ev-hayvanlarinin-sosyalizasyon-sureci",
        summary: {
            tr: "Yavru ve yetişkin hayvanların toplumsal ortamlara uyum sağlaması için gereken eğitim süreçleri ve pratik uygulamalar.",
            en: "Training processes and practical applications required for young and adult animals to adapt to social environments."
        },
        content: {
            tr: "Sosyalizasyon, hayvanların çevrelerine uyum sağlaması için kritik bir süreçtir...",
            en: "Socialization is a critical process for animals to adapt to their environment..."
        },
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Emre Doğan",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Hayvan Eğitim Uzmanı",
                en: "Animal Training Specialist"
            }
        },
        category: {
            tr: "Eğitim ve Davranış",
            en: "Training and Behavior"
        },
        tags: [
            { tr: "sosyalizasyon", en: "socialization" },
            { tr: "eğitim", en: "training" },
            { tr: "davranış", en: "behavior" },
            { tr: "adaptasyon", en: "adaptation" }
        ],
        publishDate: "2024-12-20",
        lastUpdated: "2024-12-22",
        readingTime: 11,
        views: 587,
        featured: false,
    },
    {
        id: 8,
        title: {
            tr: "Acil Veteriner Müdahalesi Gerektiren Durumlar",
            en: "Situations Requiring Emergency Veterinary Intervention"
        },
        slug: "acil-veteriner-mudahalesi-gerektiren-durumlar",
        summary: {
            tr: "Pet sahiplerinin bilmesi gereken acil durum belirtileri ve veteriner hekime başvurmadan önce yapılabilecek ilk yardım uygulamaları.",
            en: "Emergency symptoms that pet owners should know and first aid applications that can be done before consulting a veterinarian."
        },
        content: {
            tr: "Hayvan sahipleri için en korkulu anlar, dostlarımızın hastalandığı zamanlardır...",
            en: "The most frightening moments for animal owners are when our friends get sick..."
        },
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Dr. Kemal Aktaş",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Acil Veteriner Hekimi",
                en: "Emergency Veterinarian"
            }
        },
        category: {
            tr: "Sağlık ve Tıp",
            en: "Health and Medicine"
        },
        tags: [
            { tr: "acil durum", en: "emergency" },
            { tr: "veteriner", en: "veterinary" },
            { tr: "ilk yardım", en: "first aid" },
            { tr: "sağlık", en: "health" }
        ],
        publishDate: "2024-12-18",
        lastUpdated: "2024-12-20",
        readingTime: 15,
        views: 923,
        featured: true,
    },
    {
        id: 9,
        title: {
            tr: "Hayvan Dostu Bahçe Düzenleme İpuçları",
            en: "Pet-Friendly Garden Design Tips"
        },
        slug: "hayvan-dostu-bahce-duzenleme-ipuclari",
        summary: {
            tr: "Evcil hayvanlarınızın güvenli bir şekilde vakit geçirebileceği, onlar için zararsız bitkilerin bulunduğu bahçe düzenleme rehberi.",
            en: "Garden design guide with plants that are harmless to pets, where your pets can spend time safely."
        },
        content: {
            tr: "Bahçenizi düzenlerken evcil dostlarınızın güvenliğini de göz önünde bulundurmalısınız...",
            en: "When designing your garden, you should also consider the safety of your pet friends..."
        },
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Zehra Özdemir",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Peyzaj Mimarı ve Hayvan Sever",
                en: "Landscape Architect and Animal Lover"
            }
        },
        category: {
            tr: "Yaşam Alanları",
            en: "Living Spaces"
        },
        tags: [
            { tr: "bahçe", en: "garden" },
            { tr: "güvenlik", en: "safety" },
            { tr: "bitkiler", en: "plants" },
            { tr: "düzenleme", en: "design" }
        ],
        publishDate: "2024-12-15",
        lastUpdated: "2024-12-17",
        readingTime: 8,
        views: 312,
        featured: false,
    },
    {
        id: 10,
        title: {
            tr: "Gönüllü Olmak: Hayvan Refah Çalışmalarına Katılmanın Yolları",
            en: "Being a Volunteer: Ways to Participate in Animal Welfare Work"
        },
        slug: "gonullu-olmak-hayvan-refah-calismalarina-katilmanin-yollari",
        summary: {
            tr: "Hayvan hakları ve refahı alanında gönüllü olarak çalışmak isteyenler için farklı katılım yolları ve katkı sağlayabileceğiniz alanlar.",
            en: "Different ways of participation and areas where you can contribute for those who want to work as volunteers in the field of animal rights and welfare."
        },
        content: {
            tr: "Hayvanlara yardım etmek istiyorsanız birçok farklı yolunuz var...",
            en: "If you want to help animals, there are many different ways..."
        },
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: {
            name: "Canan Şahin",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            bio: {
                tr: "Gönüllü Koordinatörü",
                en: "Volunteer Coordinator"
            }
        },
        category: {
            tr: "Gönüllülük",
            en: "Volunteering"
        },
        tags: [
            { tr: "gönüllülük", en: "volunteering" },
            { tr: "katılım", en: "participation" },
            { tr: "hayvan hakları", en: "animal rights" },
            { tr: "toplum", en: "community" }
        ],
        publishDate: "2024-12-12",
        lastUpdated: "2024-12-14",
        readingTime: 6,
        views: 789,
        featured: false,
    }
];

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARTICLES_DATA;
}