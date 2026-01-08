import { supabase } from '../supabaseClient';
import { Artwork, BlogPost, AboutData, AchievementsData, Order } from '../../types';

// ==================== ARTWORKS ====================

export const fetchArtworks = async (): Promise<Artwork[]> => {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }

  // Supabase'den gelen verileri frontend formatına dönüştür
  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    imageUrl: item.image_url,
    description: item.description || '',
    date: item.date
  }));
};

export const createArtwork = async (artwork: Omit<Artwork, 'id'>): Promise<Artwork> => {
  const { data, error } = await supabase
    .from('artworks')
    .insert({
      title: artwork.title,
      category: artwork.category,
      image_url: artwork.imageUrl,
      description: artwork.description,
      date: artwork.date
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    imageUrl: data.image_url,
    description: data.description,
    date: data.date
  };
};

export const deleteArtwork = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
};

// ==================== BLOG POSTS ====================

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    imageUrl: item.image_url,
    // Backward compatibility: if images array exists, use it; otherwise convert imageUrl to array
    images: item.images && item.images.length > 0
      ? item.images
      : (item.image_url ? [item.image_url] : []),
    date: item.date
  }));
};

export const createBlogPost = async (post: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.images && post.images.length > 0 ? post.images[0] : post.imageUrl, // Keep first image in legacy field
      images: post.images, // New: store all images in array
      date: post.date
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    imageUrl: data.image_url,
    images: data.images && data.images.length > 0
      ? data.images
      : (data.image_url ? [data.image_url] : []),
    date: data.date
  };
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// ==================== ABOUT DATA ====================

export const fetchAboutData = async (): Promise<AboutData | null> => {
  const { data, error } = await supabase
    .from('about')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching about data:', error);
    return null;
  }

  if (!data) return null;

  return {
    title: data.title,
    content: data.content,
    image1: data.image1,
    image2: data.image2
  };
};

export const updateAboutData = async (aboutData: AboutData): Promise<AboutData> => {
  // Önce mevcut kaydı bul
  const { data: existingData } = await supabase
    .from('about')
    .select('id')
    .limit(1)
    .single();

  if (existingData) {
    // Güncelle
    const { data, error } = await supabase
      .from('about')
      .update({
        title: aboutData.title,
        content: aboutData.content,
        image1: aboutData.image1,
        image2: aboutData.image2,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating about data:', error);
      throw error;
    }

    return {
      title: data.title,
      content: data.content,
      image1: data.image1,
      image2: data.image2
    };
  } else {
    // Yeni kayıt oluştur
    const { data, error } = await supabase
      .from('about')
      .insert({
        title: aboutData.title,
        content: aboutData.content,
        image1: aboutData.image1,
        image2: aboutData.image2
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating about data:', error);
      throw error;
    }

    return {
      title: data.title,
      content: data.content,
      image1: data.image1,
      image2: data.image2
    };
  }
};

// ==================== ORDERS ====================

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    petType: item.pet_type,
    message: item.message,
    photoUrl: item.photo_url,
    date: item.date
  }));
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      name: order.name,
      email: order.email,
      phone: order.phone,
      pet_type: order.petType,
      message: order.message,
      photo_url: order.photoUrl,
      date: order.date
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    petType: data.pet_type,
    message: data.message,
    photoUrl: data.photo_url,
    date: data.date
  };
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ==================== STORAGE (Görseller için) ====================

export const uploadImage = async (file: File, bucket: string = 'artworks'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Public URL'i döndür
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteImage = async (url: string, bucket: string = 'artworks'): Promise<void> => {
  // URL'den dosya adını çıkar
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// ==================== ACHIEVEMENTS DATA ====================

export const fetchAchievementsData = async (): Promise<AchievementsData | null> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching achievements data:', error);
    return null;
  }

  if (!data) return null;

  return {
    image: data.image
  };
};

export const updateAchievementsData = async (achievementsData: AchievementsData): Promise<AchievementsData> => {
  // Önce mevcut kaydı bul
  const { data: existingData } = await supabase
    .from('achievements')
    .select('id')
    .limit(1)
    .single();

  if (existingData) {
    // Güncelle
    const { data, error } = await supabase
      .from('achievements')
      .update({
        image: achievementsData.image,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating achievements data:', error);
      throw error;
    }

    return {
      image: data.image
    };
  } else {
    // Yeni kayıt oluştur
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        image: achievementsData.image
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating achievements data:', error);
      throw error;
    }

    return {
      image: data.image
    };
  }
};
