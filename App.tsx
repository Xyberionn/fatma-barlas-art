import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Instagram, Mail, Camera,
  Palette, PenTool, Image as ImageIcon,
  Trash2, Plus, LogIn, ChevronRight, Lock, User, Save, Upload, MessageSquare, Cat, Phone
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from './src/supabaseClient';
import { Artwork, BlogPost, AboutData, AchievementsData, ViewState, Order } from './types';
import * as api from './src/services/api';

// --- Fallback Data (sadece about için - Supabase boşsa gösterilir) ---
const INITIAL_ABOUT: AboutData = {
  title: "Yolculuğum",
  content: `1969 yılında memur bir ailenin ilk çocuğu olarak dünyaya geldim. Gaziantep Ticaret Lisesi mezunuyum. 2008 yılında Lösemi hastalığı ile zorlu mücadelem başladı ve yaklaşık 1,5 yıl sonra tamamen iyileştim. O zamana kadar kendim için bir şey yapmadığımı fark ettim. Sanırım kanserin en güzel tarafı, tek bir hayatım olduğunu ve onu öncelikle kendim için yaşamam gerektiğini öğretmesi oldu. İstanbul'a yerleştim, resim dersleri almaya başladım. 2 yıl eğitim aldım. Ardından 2,5 yıl kadar bir resim atölyesinde asistan olarak çalıştım. Resimle haşır neşirken birden neden çektiğim fotoğrafların resimlerini yapmıyorum? diye bir düşünceye kapıldım. Yeniden eğitim aldım ve fotoğrafçılıkla tanıştım. Bu tanışma, fotoğrafı çok sevmeme; profesyonel çekimler yapmama, ödüller kazanmama ve kişisel sergiler açmama kadar uzandı. Bu arada resmi de hiç bırakmadım. Elde ettiğim bu güzel başarıya rağmen, sağlık sebeplerinden dolayı fotoğrafçılığa devam edemedim. Resimle yoluma devam ettim, birçok teknik denedim ve en sonunda renkli kuru boya kalemlerle çalışmaya karar verdim. Hayvan portreleri yapmak, onlara olan minnettarlığımı sunmak gibi geliyor.`,
  image1: "https://picsum.photos/600/800?random=10",
  image2: "https://picsum.photos/600/600?random=11"
};

const INITIAL_ACHIEVEMENTS: AchievementsData = {
  image: "https://picsum.photos/450/600?random=20"
};

// --- Utility Functions ---

// Türkçe tarih formatı: "17 Aralık 2025"
const formatTurkishDate = (dateStr: string): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// --- Sub-components ---

// 1. Modern Clean Frame
const ContentCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`bg-paper shadow-soft p-8 md:p-12 ${className}`}>
      {children}
    </div>
  );
};

// 2. Navigation
const Navigation: React.FC<{ 
  currentView: ViewState; 
  setView: (v: ViewState) => void; 
}> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'HOME', label: 'Anasayfa' },
    { id: 'GALLERY', label: 'Galeri' },
    { id: 'BLOG', label: 'Blog' },
    { id: 'CONTACT', label: 'Sipariş & İletişim' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-ink/5 shadow-sm">
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center h-24">
          {/* Logo / Name */}
          <div className="flex items-center gap-4 md:gap-6 -ml-16 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="w-14 h-14 md:w-16 md:h-16">
              <img src="/images/fm_png.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-script text-xl md:text-2xl lg:text-3xl text-ink hover:text-gold transition-colors">Fatma Barlas Özkavalcıoğlu</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-10 font-serif text-lg tracking-wide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`relative py-2 transition-colors duration-300 ${
                  currentView === item.id 
                    ? 'text-ink' 
                    : 'text-ink/60 hover:text-gold'
                }`}
              >
                {item.label}
                {currentView === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-fade-in"></span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-ink focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden bg-paper border-b border-ink/10">
          <div className="flex flex-col space-y-4 p-6 font-serif text-xl text-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as ViewState);
                  setIsOpen(false);
                }}
                className={`py-3 border-b border-ink/5 ${
                  currentView === item.id ? 'text-gold' : 'text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// 3. Hero Section
const Hero: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with slight parallax or static image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10"></div>
        <img 
          src="images/background.png" 
          alt="Art Studio Background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-20 text-center max-w-4xl mx-auto px-4 fade-in-up">
        <div className="mb-6 inline-block p-1 border-b border-gold/50">
          <span className="font-serif text-gold tracking-widest uppercase text-sm font-semibold">Hayvan Portre Sanatçısı</span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ink mb-8 leading-tight">
          Dostlarınızı <br/> <span className="font-script text-gold">Sanatla</span> Buluşturun
        </h1>
        <p className="font-serif text-lg md:text-xl text-ink/70 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Sevimli dostlarınızın en masum bakışlarını, renkli kalemlerin sıcaklığı ve el emeğinin zarafetiyle ölümsüzleştiriyorum.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={() => setView('GALLERY')}
            className="px-10 py-4 bg-ink text-paper font-serif text-lg tracking-wider hover:bg-gold hover:text-white transition-all duration-300 shadow-lg"
          >
            Galeriye Göz Atın
          </button>
          <button 
            onClick={() => setView('CONTACT')}
            className="px-10 py-4 border border-ink text-ink font-serif text-lg tracking-wider hover:bg-ink hover:text-paper transition-colors duration-300"
          >
            Sipariş Oluştur
          </button>
        </div>
      </div>
    </section>
  );
};

// 3.5 About Section
const AboutSection: React.FC<{ data: AboutData }> = ({ data }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-b border-ink/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Images Collage */}
        <div className="relative h-[500px] hidden md:block fade-in-up">
           <div className="absolute top-0 left-0 w-3/4 h-3/4 shadow-xl z-10 bg-gray-200 overflow-hidden">
             <img src={data.image1} className="w-full h-full object-cover" alt="Artist Portrait" />
           </div>
           <div className="absolute bottom-0 right-0 w-2/3 h-2/3 shadow-2xl z-20 border-8 border-paper bg-gray-200 overflow-hidden">
              <img src={data.image2} className="w-full h-full object-cover" alt="Artist Work" />
           </div>
           {/* Decorative frame box */}
           <div className="absolute top-10 right-10 w-full h-full border-2 border-gold/30 -z-10 transform translate-x-4 translate-y-4"></div>
        </div>

        {/* Mobile single image fallback */}
        <div className="md:hidden aspect-square w-full shadow-lg overflow-hidden">
           <img src={data.image1} className="w-full h-full object-cover" alt="Artist" />
        </div>

        {/* Text Content */}
        <div className="fade-in-up">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gold"></div>
              <span className="font-sans text-gold uppercase tracking-widest text-xs font-bold">Hakkımda</span>
           </div>
           <h2 className="font-serif text-4xl md:text-5xl text-ink mb-8 leading-tight">{data.title}</h2>
           <div className="prose prose-lg prose-stone font-serif text-ink/70 whitespace-pre-wrap leading-loose">
             {data.content}
           </div>
           <div className="mt-8">
             <span className="font-script text-4xl text-ink/40">Fatma Barlas Özkavalcıoğlu</span>
           </div>
        </div>
      </div>
    </section>
  );
};

// 3.6 Achievements Section
const AchievementsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-b border-ink/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Text Content - Sol taraf */}
        <div className="fade-in-up order-2 md:order-1">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gold"></div>
              <span className="font-sans text-gold uppercase tracking-widest text-xs font-bold">Başarılarım</span>
           </div>
           <h2 className="font-serif text-4xl md:text-5xl text-ink mb-8 leading-tight">Başarılarım</h2>
           <div className="space-y-5 font-serif text-ink/70 leading-relaxed">
             <div className="border-l-4 border-gold pl-6 py-2">
               <h3 className="font-bold text-lg text-ink mb-2">Uluslararası Başarılar</h3>
               <p className="text-base">Anadolu Sigorta Fotoğraf Yarışması 3'üncülük Ödülü Bronz Madalya. Los Angeles'da düzenlenen ve dünya çapında 40.000 fotoğrafçı katılımı ile gerçekleşen yarışmada ilk üçe girdim ve fotoğraflarım sergi afişi olarak kullanıldı.</p>
             </div>

             <div className="border-l-4 border-gold pl-6 py-2">
               <h3 className="font-bold text-lg text-ink mb-2">Yayınlar & Tanıtımlar</h3>
               <p className="text-base">Dünya çapında ünlü Travel Book seyahat kitabında "Kapadokya" benim fotoğraflarım ile tanıtıldı.</p>
             </div>

             <div className="border-l-4 border-gold pl-6 py-2">
               <h3 className="font-bold text-lg text-ink mb-2">Ödüller & Onur Plaketleri</h3>
               <p className="text-base">Beşiktaş Belediyesi tarafından Başarılı Fotoğrafçı plaketi, Suretialem Fotoğraf Derneği ve Sille Sanat Derneği tarafından Başarı Plaketi ile onurlandırıldım.</p>
             </div>

             <div className="border-l-4 border-gold pl-6 py-2">
               <h3 className="font-bold text-lg text-ink mb-2">Kişisel Sergiler</h3>
               <p className="text-base">Hint İnsan Fotoğraf Sergisi: İzmir Sakıp Sabancı Sanat Merkezi, Gaziantep Sanko Resim Galerisi, Ankara Hindistan Konsolosluğu.</p>
             </div>
           </div>
        </div>

        {/* Image - Sağ taraf */}
        <div className="fade-in-up order-1 md:order-2 max-w-md mx-auto">
           <div className="relative aspect-[3/4] shadow-2xl overflow-hidden bg-gray-200">
             <img
               src={achievementsData.image}
               alt="Başarılarım"
               className="w-full h-full object-cover"
             />
             {/* Decorative border */}
             <div className="absolute inset-0 border-8 border-white/10"></div>
           </div>
           {/* Decorative corner accent */}
           <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold/20 -z-10"></div>
        </div>

      </div>
    </section>
  );
};

// 4. Gallery Component
const Gallery: React.FC<{ items: Artwork[] }> = ({ items }) => {
  const [selectedImage, setSelectedImage] = useState<Artwork | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16 fade-in-up">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">Seçkin Eserler</h2>
        <div className="w-24 h-1 bg-gold mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative cursor-pointer bg-white shadow-soft p-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            onClick={() => setSelectedImage(item)}
          >
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-serif text-2xl text-ink">{item.title}</h3>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mt-2">{item.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-ink/50 hover:text-ink transition-colors">
            <X size={48} />
          </button>
          <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white shadow-2xl overflow-hidden animate-fade-in-down" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-2/3 bg-gray-50 flex items-center justify-center p-4">
               <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="max-h-[70vh] w-auto object-contain shadow-lg"
              />
            </div>
            <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center bg-paper">
              <span className="text-gold font-sans text-xs uppercase tracking-widest mb-2">{selectedImage.category}</span>
              <h3 className="font-serif text-4xl text-ink mb-6">{selectedImage.title}</h3>
              <p className="font-serif text-lg text-ink/70 leading-relaxed mb-6">{selectedImage.description}</p>
              <div className="mt-auto border-t border-ink/10 pt-6">
                <p className="font-sans text-sm text-ink/40">Tamamlanma Tarihi: {formatTurkishDate(selectedImage.date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Blog Component
const Blog: React.FC<{ 
  posts: BlogPost[]; 
  onReadMore: (post: BlogPost) => void 
}> = ({ posts, onReadMore }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
         <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">Sanat Notları</h2>
         <p className="font-sans text-ink/60">Atölyeden haberler ve ipuçları</p>
      </div>

      <div className="grid gap-12">
        {posts.map((post) => (
          <article key={post.id} className="bg-paper shadow-soft group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
            {post.imageUrl && (
              <div className="w-full md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            )}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-gold font-sans text-xs uppercase tracking-wider mb-4">
                <span>{formatTurkishDate(post.date)}</span>
                <span className="w-1 h-1 rounded-full bg-gold"></span>
                <span>Blog</span>
              </div>
              <h3 className="font-serif text-3xl text-ink mb-4 group-hover:text-gold transition-colors">{post.title}</h3>
              <p className="font-serif text-ink/70 leading-relaxed mb-8 line-clamp-3">
                {post.excerpt}
              </p>
              <div>
                <button 
                  onClick={() => onReadMore(post)}
                  className="inline-flex items-center gap-2 text-ink font-sans text-sm font-bold uppercase tracking-wider border-b border-ink/20 pb-1 hover:border-gold hover:text-gold transition-colors"
                >
                  Okumaya Devam Et <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// 6. Blog Detail
const BlogDetail: React.FC<{ post: BlogPost; onBack: () => void }> = ({ post, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-down">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center text-ink/50 hover:text-gold transition-colors font-sans text-sm tracking-wide uppercase"
      >
        <ChevronRight className="transform rotate-180 mr-1" size={16} /> Blog Listesine Dön
      </button>
      
      <ContentCard>
        <div className="text-center mb-10">
           <span className="text-gold font-sans text-sm tracking-widest uppercase block mb-4">{formatTurkishDate(post.date)}</span>
           <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-tight">{post.title}</h1>
        </div>

        {post.imageUrl && (
          <div className="w-full aspect-video mb-12 shadow-sm">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="prose prose-lg prose-stone font-serif mx-auto text-ink/80 whitespace-pre-wrap leading-loose">
          {post.content}
        </div>
        
        <div className="mt-16 pt-12 border-t border-ink/5 flex items-center justify-center">
           <span className="font-script text-3xl text-ink/40">Fatma Barlas Özkavalcıoğlu</span>
        </div>
      </ContentCard>
    </div>
  );
};

// 7. Contact / Order Form
const Contact: React.FC<{ onSubmit: (order: Order) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    petType: string;
    message: string;
    photoUrl: string;
  }>({
    name: '',
    email: '',
    phone: '',
    petType: 'Kedi',
    message: '',
    photoUrl: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // EmailJS ile email gönder (hassas bilgiler burada)
    const emailParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      petType: formData.petType,
      message: formData.message,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // EmailJS ile gönder
      await emailjs.send(
        'service_ke464cd',      // Service ID
        'template_ob4ty8g',     // Template ID
        emailParams,
        'N7sAfgfxjzd9AwkG0'     // Public Key
      );

      console.log('Email başarıyla gönderildi!');
    } catch (error) {
      console.error('Email gönderilemedi:', error);
      alert('Sipariş kaydedildi ama email gönderilemedi. Lütfen direkt iletişime geçin.');
    }

    // Sipariş objesi oluştur (Supabase'e kaydedilecek)
    const newOrder: Order = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      petType: formData.petType,
      message: formData.message,
      photoUrl: formData.photoUrl,
      date: new Date().toISOString().split('T')[0]
    };

    onSubmit(newOrder);

    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', petType: 'Kedi', message: '', photoUrl: '' });
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Info Column */}
        <div className="fade-in-up">
           <h2 className="font-serif text-5xl text-ink mb-6">Sipariş Oluşturun</h2>
           <p className="font-serif text-xl text-ink/70 mb-10 leading-relaxed">
             Evcil hayvanınızın fotoğrafını bir sanat eserine dönüştürmek için ilk adımı atın. Fotoğrafınızı yükleyin, detayları yazın, sizinle iletişime geçelim.
           </p>
           
           <div className="space-y-8 mt-12">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-white shadow-sm rounded-full text-gold">
                 <Mail size={24} />
               </div>
               <div>
                 <h4 className="font-sans font-bold text-ink uppercase text-sm tracking-wider mb-1">E-Posta</h4>
                 <p className="font-serif text-lg text-ink/80">barlasfatma34@gmail.com</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4">
               <div className="p-3 bg-white shadow-sm rounded-full text-gold">
                 <Instagram size={24} />
               </div>
               <div>
                 <h4 className="font-sans font-bold text-ink uppercase text-sm tracking-wider mb-1">Instagram</h4>
                 <a href="https://www.instagram.com/fbrls_art" target="_blank" rel="noopener noreferrer" className="font-serif text-lg text-ink/80 hover:text-gold transition-colors">@fbrls_art</a>
               </div>
             </div>
           </div>
        </div>

        {/* Form Column */}
        <ContentCard className="fade-in-up">
          {isSubmitted ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <PenTool size={32} />
              </div>
              <h3 className="font-serif text-3xl text-ink mb-2">Teşekkürler</h3>
              <p className="font-sans text-ink/60 mb-8">Sipariş talebiniz ve fotoğrafınız başarıyla iletildi. En kısa sürede dönüş yapacağız.</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-gold underline hover:text-ink transition-colors"
              >
                Yeni form gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">Ad Soyad</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold focus:bg-white transition-all font-serif text-lg"
                  placeholder="İsim Giriniz"
                />
              </div>
              
              <div>
                <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">E-Posta</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold focus:bg-white transition-all font-serif text-lg"
                  placeholder="mail@ornek.com"
                />
              </div>
                            <div>
                <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">Telefon Numarası</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold focus:bg-white transition-all font-serif text-lg"
                  placeholder="0(5xx) xxx xx xx"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">Tür</label>
                  <select 
                    value={formData.petType}
                    onChange={(e) => setFormData({...formData, petType: e.target.value})}
                    className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold focus:bg-white transition-all font-serif text-lg"
                  >
                    <option>Kedi</option>
                    <option>Köpek</option>
                    <option>Kuş</option>
                    <option>Diğer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">Referans Fotoğraf (Zorunlu)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer group">
                  <input 
                    required
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.photoUrl ? (
                    <div className="flex flex-col items-center">
                       <img src={formData.photoUrl} alt="Preview" className="h-32 object-contain mb-2 shadow-sm" />
                       <span className="text-green-600 font-sans text-sm font-bold">Fotoğraf Seçildi</span>
                       <span className="text-xs text-gray-400 mt-1">Değiştirmek için tıklayın</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gold transition-colors">
                      <Upload size={32} className="mb-2" />
                      <span className="font-serif text-lg">Fotoğraf Yüklemek İçin Tıklayın</span>
                      <span className="text-xs font-sans mt-1">veya sürükleyip bırakın</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">Mesajınız / Özel İstekler</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold focus:bg-white transition-all font-serif text-lg"
                  placeholder="Çizimle ilgili özel detaylar..."
                ></textarea>
              </div>

              <div className="pt-4">
                 <button 
                  type="submit"
                  className="w-full py-4 bg-ink text-paper font-serif uppercase tracking-widest hover:bg-gold transition-colors duration-300 shadow-lg"
                >
                  Siparişi Gönder
                </button>
              </div>
            </form>
          )}
        </ContentCard>
      </div>
    </div>
  );
};

// 8. Admin Dashboard (Updated Layout)
interface AdminProps {
  artworks: Artwork[];
  setArtworks: React.Dispatch<React.SetStateAction<Artwork[]>>;
  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  aboutData: AboutData;
  setAboutData: React.Dispatch<React.SetStateAction<AboutData>>;
  achievementsData: AchievementsData;
  setAchievementsData: React.Dispatch<React.SetStateAction<AchievementsData>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ artworks, setArtworks, blogs, setBlogs, aboutData, setAboutData, achievementsData, setAchievementsData, orders, setOrders, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'GALLERY' | 'BLOG' | 'ABOUT' | 'ORDERS'>('GALLERY');
  const [newArt, setNewArt] = useState<Partial<Artwork>>({ category: 'Kedi Portresi' });
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({});
  
  // Local state for About form to allow editing before saving
  const [aboutForm, setAboutForm] = useState<AboutData>(aboutData);
  const [achievementsForm, setAchievementsForm] = useState<AchievementsData>(achievementsData);

  // Sync about form if prop changes
  useEffect(() => {
    setAboutForm(aboutData);
  }, [aboutData]);

  useEffect(() => {
    setAchievementsForm(achievementsData);
  }, [achievementsData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ART' | 'BLOG' | 'ABOUT_1' | 'ABOUT_2' | 'ACHIEVEMENTS') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'ART') setNewArt({ ...newArt, imageUrl: reader.result as string });
        else if (type === 'BLOG') setNewBlog({ ...newBlog, imageUrl: reader.result as string });
        else if (type === 'ABOUT_1') setAboutForm({ ...aboutForm, image1: reader.result as string });
        else if (type === 'ABOUT_2') setAboutForm({ ...aboutForm, image2: reader.result as string });
        else if (type === 'ACHIEVEMENTS') setAchievementsForm({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addArtwork = async () => {
    if (!newArt.title || !newArt.imageUrl) return alert('Lütfen başlık ve görsel ekleyin');

    try {
      const art: Omit<Artwork, 'id'> = {
        title: newArt.title,
        category: newArt.category || 'Diğer',
        imageUrl: newArt.imageUrl,
        description: newArt.description || '',
        date: newArt.date || new Date().toISOString().split('T')[0] // Kullanıcı girmezse bugünün tarihi
      };

      const createdArt = await api.createArtwork(art);
      setArtworks([createdArt, ...artworks]);
      setNewArt({ title: '', category: 'Kedi Portresi', description: '', imageUrl: '', date: '' });
      alert('✅ Eser başarıyla eklendi!');
    } catch (error) {
      console.error('Eser eklenemedi:', error);
      alert('❌ Eser eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const deleteArtwork = async (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteArtwork(id);
        setArtworks(artworks.filter(a => a.id !== id));
        alert('✅ Eser silindi');
      } catch (error) {
        console.error('Eser silinemedi:', error);
        alert('❌ Eser silinemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const addBlog = async () => {
    if (!newBlog.title || !newBlog.content) return alert('Başlık ve içerik zorunludur');

    try {
      const blog: Omit<BlogPost, 'id'> = {
        title: newBlog.title,
        excerpt: newBlog.excerpt || newBlog.content.substring(0, 100) + '...',
        content: newBlog.content,
        date: new Date().toISOString().split('T')[0],
        imageUrl: newBlog.imageUrl
      };

      const createdBlog = await api.createBlogPost(blog);
      setBlogs([createdBlog, ...blogs]);
      setNewBlog({ title: '', excerpt: '', content: '', imageUrl: '' });
      alert('✅ Blog yazısı eklendi!');
    } catch (error) {
      console.error('Blog eklenemedi:', error);
      alert('❌ Blog eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const deleteBlog = async (id: string) => {
     if (confirm('Silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteBlogPost(id);
        setBlogs(blogs.filter(b => b.id !== id));
        alert('✅ Blog silindi');
      } catch (error) {
        console.error('Blog silinemedi:', error);
        alert('❌ Blog silinemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const deleteOrder = async (id: string) => {
    if(confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteOrder(id);
        setOrders(orders.filter(o => o.id !== id));
        alert('✅ Sipariş silindi');
      } catch (error) {
        console.error('Sipariş silinemedi:', error);
        alert('❌ Sipariş silinemedi. Lütfen tekrar deneyin.');
      }
    }
  }

  const saveAbout = async () => {
    try {
      const updatedAbout = await api.updateAboutData(aboutForm);
      setAboutData(updatedAbout);
      alert("✅ Hakkında bölümü güncellendi!");
    } catch (error) {
      console.error('Hakkında güncellenemedi:', error);
      alert('❌ Güncellenemedi. Lütfen tekrar deneyin.');
    }
  }

  const saveAchievements = async () => {
    try {
      const updatedAchievements = await api.updateAchievementsData(achievementsForm);
      setAchievementsData(updatedAchievements);
      alert("✅ Başarılar fotoğrafı güncellendi!");
    } catch (error) {
      console.error('Başarılar fotoğrafı güncellenemedi:', error);
      alert('❌ Güncellenemedi. Lütfen tekrar deneyin.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-6">
        <div>
          <h2 className="font-serif text-3xl text-ink">Yönetici Paneli</h2>
          <p className="text-ink/60 font-sans text-sm mt-1">İçerik Yönetim Sistemi</p>
        </div>
        <button onClick={onLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 font-sans text-sm transition-colors">
          Çıkış Yap
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white p-1 rounded-lg w-fit shadow-sm border border-ink/5">
        <button 
          onClick={() => setActiveTab('GALLERY')}
          className={`px-6 py-2 rounded-md transition-all font-sans text-sm font-bold ${activeTab === 'GALLERY' ? 'bg-ink text-white shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          Galeri
        </button>
        <button 
          onClick={() => setActiveTab('BLOG')}
          className={`px-6 py-2 rounded-md transition-all font-sans text-sm font-bold ${activeTab === 'BLOG' ? 'bg-ink text-white shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          Blog
        </button>
        <button 
          onClick={() => setActiveTab('ABOUT')}
          className={`px-6 py-2 rounded-md transition-all font-sans text-sm font-bold ${activeTab === 'ABOUT' ? 'bg-ink text-white shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          Hakkında
        </button>
        <button 
          onClick={() => setActiveTab('ORDERS')}
          className={`px-6 py-2 rounded-md transition-all font-sans text-sm font-bold flex items-center gap-2 ${activeTab === 'ORDERS' ? 'bg-ink text-white shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          Siparişler <span className="bg-gold text-white text-[10px] px-1.5 rounded-full">{orders.length}</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-soft min-h-[500px]">
        {activeTab === 'GALLERY' && (
          <div>
            <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Yeni Eser Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
              <input 
                placeholder="Eser Adı" 
                className="border p-3 rounded bg-white"
                value={newArt.title || ''}
                onChange={e => setNewArt({...newArt, title: e.target.value})}
              />
              <select 
                className="border p-3 rounded bg-white"
                value={newArt.category}
                onChange={e => setNewArt({...newArt, category: e.target.value})}
              >
                <option>Kedi Portresi</option>
                <option>Köpek Portresi</option>
                <option>Diğer</option>
              </select>
              <textarea
                placeholder="Açıklama"
                className="border p-3 rounded bg-white md:col-span-2"
                rows={3}
                value={newArt.description || ''}
                onChange={e => setNewArt({...newArt, description: e.target.value})}
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2 font-bold">Tamamlanma Tarihi (İsteğe Bağlı)</label>
                <input
                  type="date"
                  className="border p-3 rounded bg-white w-full"
                  value={newArt.date || ''}
                  onChange={e => setNewArt({...newArt, date: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız bugünün tarihi kullanılır</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2 font-bold">Görsel Yükle</label>
                <input type="file" className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gold/10 file:text-gold
                  hover:file:bg-gold/20
                " accept="image/*" onChange={(e) => handleImageUpload(e, 'ART')} />
              </div>
              <div className="md:col-span-2 text-right">
                <button onClick={addArtwork} className="bg-ink text-white px-6 py-3 rounded hover:bg-gold transition-colors flex items-center gap-2 ml-auto">
                  <Plus size={18} /> Eseri Yayınla
                </button>
              </div>
            </div>

            <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs mt-12">Yayındaki Eserler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {artworks.map(art => (
                <div key={art.id} className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                     <img src={art.imageUrl} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => deleteArtwork(art.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-transform"
                        >
                          <Trash2 size={20} />
                        </button>
                     </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm truncate text-ink">{art.title}</p>
                    <p className="text-xs text-gray-500">{art.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'BLOG' && (
          <div>
            <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Yeni Blog Yazısı</h3>
            <div className="grid grid-cols-1 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
              <input 
                placeholder="Blog Başlığı" 
                className="border p-3 rounded bg-white"
                value={newBlog.title || ''}
                onChange={e => setNewBlog({...newBlog, title: e.target.value})}
              />
              <textarea 
                placeholder="Kısa Özet (Listeleme sayfasında görünür)" 
                className="border p-3 rounded bg-white h-24"
                value={newBlog.excerpt || ''}
                onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})}
              />
              <textarea 
                placeholder="İçerik (Paragraflar arası boşluk bırakınız)" 
                className="border p-3 rounded bg-white h-64 font-serif text-lg"
                value={newBlog.content || ''}
                onChange={e => setNewBlog({...newBlog, content: e.target.value})}
              />
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-bold">Kapak Görseli</label>
                <input type="file" className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gold/10 file:text-gold
                  hover:file:bg-gold/20
                " accept="image/*" onChange={(e) => handleImageUpload(e, 'BLOG')} />
              </div>
              <div className="text-right">
                <button onClick={addBlog} className="bg-ink text-white px-6 py-3 rounded hover:bg-gold transition-colors flex items-center gap-2 ml-auto">
                  <Plus size={18} /> Yazıyı Yayınla
                </button>
              </div>
            </div>

             <div className="mt-12">
              <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Yayındaki Yazılar</h3>
              <div className="space-y-4">
                {blogs.map(blog => (
                  <div key={blog.id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {blog.imageUrl && <img src={blog.imageUrl} className="w-12 h-12 rounded object-cover" />}
                      <span className="font-serif font-bold text-lg text-ink">{blog.title}</span>
                    </div>
                    <button onClick={() => deleteBlog(blog.id)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ABOUT' && (
          <div>
             <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Hakkında Bölümünü Düzenle</h3>
             <div className="grid grid-cols-1 gap-6 mb-8">
               <input 
                  placeholder="Bölüm Başlığı" 
                  className="border p-3 rounded bg-white w-full"
                  value={aboutForm.title}
                  onChange={e => setAboutForm({...aboutForm, title: e.target.value})}
                />
                <textarea 
                  placeholder="Hakkında Yazısı" 
                  className="border p-3 rounded bg-white h-64 font-serif text-lg w-full"
                  value={aboutForm.content}
                  onChange={e => setAboutForm({...aboutForm, content: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm text-gray-600 mb-2 font-bold">1. Fotoğraf (Dikey önerilir)</label>
                      {aboutForm.image1 && <img src={aboutForm.image1} className="h-40 object-cover mb-2 rounded border" />}
                      <input type="file" className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gold/10 file:text-gold
                        hover:file:bg-gold/20
                      " accept="image/*" onChange={(e) => handleImageUpload(e, 'ABOUT_1')} />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-2 font-bold">2. Fotoğraf (Kare önerilir)</label>
                      {aboutForm.image2 && <img src={aboutForm.image2} className="h-40 object-cover mb-2 rounded border" />}
                      <input type="file" className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gold/10 file:text-gold
                        hover:file:bg-gold/20
                      " accept="image/*" onChange={(e) => handleImageUpload(e, 'ABOUT_2')} />
                   </div>
                </div>

                <div className="text-right pt-6 border-t border-ink/5">
                  <button onClick={saveAbout} className="bg-ink text-white px-8 py-3 rounded hover:bg-gold transition-colors flex items-center gap-2 ml-auto shadow-lg">
                    <Save size={18} /> Değişiklikleri Kaydet
                  </button>
                </div>
             </div>

             {/* Başarılar Fotoğrafı */}
             <div className="mt-12 pt-12 border-t-2 border-ink/10">
               <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Başarılar Fotoğrafı</h3>
               <div className="grid grid-cols-1 gap-6">
                 <div>
                   <label className="block text-sm text-gray-600 mb-2 font-bold">Başarılar Bölümü Fotoğrafı (Dikey önerilir)</label>
                   {achievementsForm.image && (
                     <img src={achievementsForm.image} className="h-64 object-cover mb-4 rounded border shadow-md" alt="Başarılar" />
                   )}
                   <input
                     type="file"
                     className="block w-full text-sm text-slate-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-gold/10 file:text-gold
                       hover:file:bg-gold/20
                     "
                     accept="image/*"
                     onChange={(e) => handleImageUpload(e, 'ACHIEVEMENTS')}
                   />
                 </div>

                 <div className="text-right pt-6 border-t border-ink/5">
                   <button onClick={saveAchievements} className="bg-ink text-white px-8 py-3 rounded hover:bg-gold transition-colors flex items-center gap-2 ml-auto shadow-lg">
                     <Save size={18} /> Başarılar Fotoğrafını Kaydet
                   </button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div>
            <h3 className="font-serif text-xl mb-6 font-bold text-gold uppercase tracking-widest text-xs">Gelen Siparişler</h3>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                <p>Henüz sipariş bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-8 relative hover:shadow-md transition-shadow">
                     <button 
                        onClick={() => deleteOrder(order.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        title="Siparişi Sil"
                     >
                       <Trash2 size={20} />
                     </button>
                     
                     <div className="w-full md:w-1/4 flex-shrink-0">
                       <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                         {order.photoUrl ? (
                           <img src={order.photoUrl} alt={order.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <ImageIcon size={32} />
                           </div>
                         )}
                       </div>
                     </div>
                     
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                           <h4 className="font-serif text-2xl text-ink font-bold">{order.name}</h4>
                           <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{order.petType}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 border-b border-gray-100 pb-4">
                           <div className="flex items-center gap-2">
                             <span className="font-bold">Tarih:</span> {formatTurkishDate(order.date)}
                           </div>
                           <div className="flex items-center gap-2">
                             <Mail size={14} />
                             <span className="font-bold">Email:</span>
                             <a href={`mailto:${order.email}`} className="text-blue-600 hover:underline">{order.email}</a>
                           </div>
                           <div className="flex items-center gap-2">
                             <Phone size={14} />
                             <span className="font-bold">Telefon:</span>
                             <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">{order.phone}</a>
                           </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-2">
                            <MessageSquare size={14} /> Müşteri Mesajı
                          </h5>
                          <p className="bg-gray-50 p-4 rounded text-ink/80 font-serif leading-relaxed italic">
                            "{order.message}"
                          </p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// 9. Login Modal
const LoginModal: React.FC<{ onClose: () => void; onLogin: () => void }> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email veya şifre hatalı!');
        setLoading(false);
        return;
      }

      if (data.user) {
        onLogin();
        onClose();
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-ink transition-colors"><X size={24} /></button>
        <div className="text-center mb-6">
           <div className="w-12 h-12 bg-ink text-white rounded-full flex items-center justify-center mx-auto mb-4">
             <Lock size={20} />
           </div>
           <h2 className="text-2xl font-serif text-ink">Yönetici Girişi</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold font-sans transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Şifre"
              className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-gold font-sans transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-3 rounded font-serif hover:bg-gold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // State - Supabase'den gelecek
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [aboutData, setAboutData] = useState<AboutData>(INITIAL_ABOUT);
  const [achievementsData, setAchievementsData] = useState<AchievementsData>(INITIAL_ACHIEVEMENTS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Supabase'den veri yükleme
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Paralel olarak tüm verileri çek
        const [artworksData, blogsData, aboutDataResult, achievementsDataResult, ordersData] = await Promise.all([
          api.fetchArtworks(),
          api.fetchBlogPosts(),
          api.fetchAboutData(),
          api.fetchAchievementsData(),
          api.fetchOrders().catch(() => []) // Orders sadece authenticated kullanıcılar görebilir
        ]);

        // Supabase'den gelen veriyi olduğu gibi kullan (boş bile olsa)
        setArtworks(artworksData);
        setBlogs(blogsData);
        setAboutData(aboutDataResult || INITIAL_ABOUT);
        setAchievementsData(achievementsDataResult || INITIAL_ACHIEVEMENTS);
        setOrders(ordersData);

        console.log('✅ Veriler Supabase\'den yüklendi');
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        // Hata durumunda boş state bırak - INITIAL değerleri kullanma!
        alert('Veriler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check for secret admin URL hash
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#admin-gizli-2024') {
        setShowLogin(true);
        // Clear hash from URL for security
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);

    return () => window.removeEventListener('hashchange', checkAdminHash);
  }, []);

  // Handlers
  const handleReadBlog = (post: BlogPost) => {
    setSelectedPost(post);
    setView('BLOG_DETAIL');
    window.scrollTo(0, 0);
  };

  const handleNav = (v: ViewState) => {
    setView(v);
    window.scrollTo(0, 0);
  };

  const handleOrderSubmit = async (order: Order) => {
    try {
      const createdOrder = await api.createOrder(order);
      setOrders([createdOrder, ...orders]);
      console.log('✅ Sipariş Supabase\'e kaydedildi');
    } catch (error) {
      console.error('Sipariş kaydedilemedi:', error);
      alert('Sipariş kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Loading ekranı
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-xl text-ink/60">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-ink">
      <Navigation currentView={view} setView={handleNav} />

      <main className="flex-grow">
        {view === 'HOME' && (
          <div className="space-y-12">
            <Hero setView={handleNav} />

            {/* About Section */}
            <AboutSection data={aboutData} />

            {/* Achievements Section */}
            <AchievementsSection />

            {/* Featured Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 pt-10">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                  <div>
                    <h3 className="font-serif text-4xl text-ink mb-2">Son Eserler</h3>
                    <div className="h-1 w-20 bg-gold"></div>
                  </div>
                  <button onClick={() => handleNav('GALLERY')} className="hidden md:flex items-center gap-2 text-ink hover:text-gold transition-colors font-serif italic text-lg mt-4 md:mt-0">
                    Tüm Koleksiyonu İncele <ChevronRight size={20} />
                  </button>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {artworks.slice(0, 4).map(art => (
                   <div key={art.id} onClick={() => handleNav('GALLERY')} className="cursor-pointer overflow-hidden aspect-square group relative shadow-soft">
                     <img src={art.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={art.title} />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                   </div>
                 ))}
               </div>
               
               <div className="text-center mt-12 md:hidden">
                 <button onClick={() => handleNav('GALLERY')} className="text-gold font-serif underline underline-offset-4 hover:text-ink transition-colors">Tüm Galeriye Git</button>
               </div>
            </div>
          </div>
        )}

        {view === 'GALLERY' && (
          <div className="animate-fade-in">
            <Gallery items={artworks} />
          </div>
        )}

        {view === 'BLOG' && (
          <div className="animate-fade-in">
            <Blog posts={blogs} onReadMore={handleReadBlog} />
          </div>
        )}

        {view === 'BLOG_DETAIL' && selectedPost && (
          <BlogDetail post={selectedPost} onBack={() => handleNav('BLOG')} />
        )}

        {view === 'CONTACT' && (
          <div className="animate-fade-in">
            <Contact onSubmit={handleOrderSubmit} />
          </div>
        )}

        {view === 'ADMIN' && (
          <div className="animate-fade-in">
            <Admin
              artworks={artworks}
              setArtworks={setArtworks}
              blogs={blogs}
              setBlogs={setBlogs}
              aboutData={aboutData}
              setAboutData={setAboutData}
              achievementsData={achievementsData}
              setAchievementsData={setAchievementsData}
              orders={orders}
              setOrders={setOrders}
              onLogout={() => { setIsAdmin(false); handleNav('HOME'); }}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-ink/5 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-script text-3xl text-ink mb-2">Fatma Barlas Özkavalcıoğlu</h4>
            <p className="font-serif text-sm text-ink/40 tracking-wider uppercase">
              © 2024 Tüm Hakları Saklıdır
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-6">
               <a href="https://www.instagram.com/fbrls_art" target="_blank" rel="noopener noreferrer" className="text-ink/40 hover:text-gold transition-colors"><Instagram size={20} /></a>
               <a href="mailto:barlasfatma34@gmail.com" className="text-ink/40 hover:text-gold transition-colors"><Mail size={20} /></a>
               <button onClick={() => setShowLogin(true)} className="text-ink/40 hover:text-gold transition-colors opacity-0 hover:opacity-100">
                 <Lock size={20} />
               </button>
            </div>
          </div>
        </div>
      </footer>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setIsAdmin(true); handleNav('ADMIN'); }} />
      )}
    </div>
  );
}

export default App;