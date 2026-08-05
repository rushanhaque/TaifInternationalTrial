import MorphSlider from './reactbits/MorphSlider';
import '../styles/ReviewStack.css';

const REVIEWS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Interior Designer',
    text: 'The craftsmanship on these wooden pieces is unparalleled. They brought a unique warmth to my client\'s living space.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Architect',
    text: 'Taif\'s attention to detail is evident in every curve. The brass accents perfectly complement the rich walnut textures.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Art Director',
    text: 'Absolutely stunning work. The fusion of traditional Moradabad metalwork with Saharanpur wood carving creates something entirely new.',
    rating: 5,
    sliderItems: [
      { image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop', caption: 'Bespoke Chair' },
      { image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop', caption: 'Brass Detailing' },
      { image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop', caption: 'Walnut Finish' }
    ]
  },
  {
    id: 4,
    name: 'David Rossi',
    role: 'Collector',
    text: 'I\'ve collected artisanal furniture for years, and the pieces from Taif stand out for their exceptional quality and narrative.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Olivia Martinez',
    role: 'Homeowner',
    text: 'The dining table we received is a masterpiece. It has become the centerpiece of our home and a conversation starter for every guest.',
    rating: 5,
  }
];

export default function ReviewStack() {
  return (
    <div className="review-stack-container">
      <div className="review-stack">
        {REVIEWS.map((review, index) => {
          // Index 0: Left Far
          // Index 1: Left Near
          // Index 2: Center (Front)
          // Index 3: Right Near
          // Index 4: Right Far
          
          let positionClass = '';
          if (index === 0) positionClass = 'pos-left-far';
          else if (index === 1) positionClass = 'pos-left-near';
          else if (index === 2) positionClass = 'pos-center';
          else if (index === 3) positionClass = 'pos-right-near';
          else if (index === 4) positionClass = 'pos-right-far';

          return (
            <div key={review.id} className={`review-card ${positionClass}`}>
              {index === 2 && review.sliderItems ? (
                <div className="review-card-media">
                  <MorphSlider 
                    items={review.sliderItems} 
                    transition="melt"
                    intensity={0.55}
                    aberration={0.35}
                    drift={0.4}
                    autoplay={true}
                    radius={12}
                  />
                </div>
              ) : null}
              
              <div className="review-card-content">
                <div className="review-stars">
                  {'★'.repeat(review.rating)}
                </div>
                <p className="review-text">"{review.text}"</p>
                <div className="review-author">
                  <strong>{review.name}</strong>
                  <span>{review.role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
