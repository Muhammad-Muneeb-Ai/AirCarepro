import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPreviewProps {
  posts: BlogPost[];
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="relative flex flex-col items-center text-center gap-4 mb-16">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Latest Insights</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              From Our Blog
            </h2>
          </div>
          <Link 
            to="/blog" 
            className="md:absolute md:right-0 md:bottom-0 text-blue-600 font-bold flex items-center gap-2 hover:gap-4 transition-all mt-4 md:mt-0"
          >
            View All Posts <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.featured_image_url || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=800'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
              <div className="p-8">
                <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">{post.category || 'Maintenance'}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="text-blue-600 font-bold flex items-center gap-2 group/link">
                  Read More <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
