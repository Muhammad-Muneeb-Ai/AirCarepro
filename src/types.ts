export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  price: string;
  image: string;
  ctaText: string;
  order: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'archived';
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url: string;
  publish_date: any;
  status: 'draft' | 'published';
  created_at: any;
  category?: string;
  excerpt?: string;
}

export interface PageContent {
  id: string;
  section: string;
  content: any;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
}
