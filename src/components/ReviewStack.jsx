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
  // Duplicate array for seamless infinite marquee loop
  const carouselReviews = [...REVIEWS, ...REVIEWS];

  return (
    <div className="review-carousel-container">
      <div className="review-marquee-wrapper">
        <div className="review-marquee-track">
          {carouselReviews.map((review, idx) => {
            const initials = review.name.split(' ').map(n => n[0]).join('');
            return (
              <div key={`${review.id}-${idx}`} className="review-card-item">
                <div className="review-card-top">
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}
                  </div>
                  <div className="review-quote-icon">“</div>
                </div>
                
                <p className="review-text">"{review.text}"</p>

                <div className="review-author">
                  <div className="review-avatar">
                    {initials}
                  </div>
                  <div className="review-author-info">
                    <strong>{review.name}</strong>
                    <span>{review.role}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
