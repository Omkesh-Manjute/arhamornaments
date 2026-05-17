import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: "Priya Sharma",
    date: "2 weeks ago",
    rating: 5,
    title: "Absolutely Stunning!",
    comment: "The craftsmanship is beyond expectations. The finishing is so premium, and it looks exactly like the picture. Very happy with my purchase!",
    verified: true
  },
  {
    id: 2,
    name: "Anjali Desai",
    date: "1 month ago",
    rating: 5,
    title: "Perfect for daily wear",
    comment: "I've been wearing this every day and the shine hasn't faded a bit. The quality of gold is top-notch. Highly recommend Arham Ornaments.",
    verified: true
  },
  {
    id: 3,
    name: "Neha Verma",
    date: "2 months ago",
    rating: 4,
    title: "Beautiful design, safe delivery",
    comment: "The piece is gorgeous and the packaging was very secure. Customer support was also helpful on WhatsApp when I had questions.",
    verified: true
  }
];

const CustomerReviews: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 border-t border-gray-100">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">
        
        {/* Rating Summary */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Testimonials</h4>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-charcoal">Customer Reviews</h2>
          </div>
          
          <div className="flex items-center gap-6 py-4">
            <div className="text-6xl font-heading font-bold text-charcoal">4.8</div>
            <div className="space-y-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={i < 4 ? "text-gold fill-gold" : i === 4 ? "text-gold fill-gold opacity-50" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Based on 124 reviews</p>
            </div>
          </div>
          
          {/* Rating Bars */}
          <div className="space-y-3 pt-4">
            {[
              { stars: 5, pct: 85 },
              { stars: 4, pct: 10 },
              { stars: 3, pct: 5 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 w-12 text-gray-500 font-bold">
                  {row.stars} <Star size={12} className="fill-gray-400 text-gray-400" />
                </div>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <div className="w-8 text-right text-xs text-gray-400 font-bold">{row.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-8">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{review.name}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? "text-gold fill-gold" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              
              <h5 className="font-bold text-charcoal mb-2">{review.title}</h5>
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
          
          <button className="w-full py-4 text-sm font-black uppercase tracking-widest text-charcoal border-2 border-gray-100 rounded-2xl hover:border-charcoal hover:bg-gray-50 transition-colors">
            Read All Reviews
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerReviews;
