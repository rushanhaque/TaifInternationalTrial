import React, { useRef } from 'react';
import CubeCard from './CubeCard';
import './MaterialSlider.css';

/**
 * Pure display component — activeIndex is fully controlled by the parent.
 * Scroll logic lives in MaterialsPage so the whole section responds.
 */
const MaterialSlider = ({ materials = [], activeIndex = 0, onSelect }) => {

  const getClassForIndex = (index) => {
    if (index === activeIndex) return '-current';

    const prevIndex = (activeIndex - 1 + materials.length) % materials.length;
    const nextIndex = (activeIndex + 1) % materials.length;

    if (index === prevIndex) return '-prev';
    if (index === nextIndex) return '-next';

    const diff = (index - activeIndex + materials.length) % materials.length;
    if (diff > materials.length / 2) return '-prev-hidden';
    return '-next-hidden';
  };

  if (!materials.length) return null;

  return (
    <div className="slider-container">
      {/* Scroll hint */}
      <div className="slider-hint">
        <span className="slider-hint__icon">↕</span>
        <span className="slider-hint__text">Scroll to browse</span>
      </div>

      <ul className="slider-heo__inner">
        {materials.map((mat, index) => (
          <li
            key={mat.id}
            className={`slider-heo__item ${getClassForIndex(index)}`}
            onClick={() => onSelect && onSelect(index)}
            onMouseEnter={() => onSelect && onSelect(index)}
          >
            <CubeCard material={mat} isActive={index === activeIndex} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialSlider;
