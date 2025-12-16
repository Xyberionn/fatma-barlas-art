export interface Artwork {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export interface AboutData {
  title: string;
  content: string;
  image1: string;
  image2: string;
}

export interface Order {
  id: string;
  name: string;
  petType: string;
  message: string;
  photoUrl: string; // Base64 string for the uploaded reference photo
  date: string;
  // email ve phone sadece email'e gönderilir, localStorage'da tutulmaz
}

export interface UserUser {
  isAdmin: boolean;
}

export type ViewState = 'HOME' | 'GALLERY' | 'BLOG' | 'CONTACT' | 'ADMIN' | 'BLOG_DETAIL';