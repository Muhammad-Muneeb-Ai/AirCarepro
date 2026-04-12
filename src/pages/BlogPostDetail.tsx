import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, Clock, Share2, Bookmark } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { BlogPost } from '../types';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', slug),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setPost({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as BlogPost);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Post Not Found</h1>
        <p className="text-slate-500 mt-4">The blog post you're looking for doesn't exist or has been moved.</p>
        <Link to="/blog" className="text-blue-600 mt-8 inline-block font-bold hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold mb-8 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">
                {post.category || 'Maintenance'}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                {post.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">AirCare Team</span>
                  <span className="text-sm text-slate-500">Expert Contributor</span>
                </div>
              </div>
              <div className="flex items-center gap-8 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>
                    {post.publish_date instanceof Date 
                      ? post.publish_date.toLocaleDateString()
                      : post.publish_date?.toDate 
                        ? post.publish_date.toDate().toLocaleDateString()
                        : String(post.publish_date || '')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>5 min read</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>

            <div className="rounded-[40px] overflow-hidden shadow-2xl aspect-video bg-slate-100">
              <img
                src={post.featured_image_url || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=1200'}
                alt={post.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=1200';
                }}
              />
            </div>

            <div 
              className="prose prose-lg prose-slate max-w-none mt-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
