import React, { useState } from 'react';

const CubeCard = ({ material, isActive }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="slider-heo__item__inner">
      <div 
        className="cube-box"
        onMouseEnter={() => isActive && setIsHovering(true)}
        onMouseLeave={() => isActive && setIsHovering(false)}
      >
        <div className="cube-wrap">
          <div className="cube">
            <div 
              className="cube-inner" 
              style={{ 
                transform: 'rotateX(0deg)'
              }}
            >
              {/* Front Face — texture only */}
              <div className="face face__front" style={{ backgroundImage: `url(${material.image})` }} />
              {/* Back Face — texture only */}
              <div className="face face__back" style={{ backgroundImage: `url(${material.image})` }} />
              {/* Side Faces (Texture only) */}
              <div className="face face__right" style={{ backgroundImage: `url(${material.image})` }}></div>
              <div className="face face__left" style={{ backgroundImage: `url(${material.image})` }}></div>
              <div className="face face__top" style={{ backgroundImage: `url(${material.image})` }}></div>
              <div className="face face__bottom" style={{ backgroundImage: `url(${material.image})` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubeCard;
