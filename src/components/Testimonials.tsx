import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

interface TestimonialsProps {
  content: Testimonial[];
}

export default function Testimonials({ content }: TestimonialsProps) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mt-4">
            What Our Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.map((t: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-6"
            >
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-lg text-slate-700 italic leading-relaxed">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {t.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span className="text-sm text-slate-500">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
