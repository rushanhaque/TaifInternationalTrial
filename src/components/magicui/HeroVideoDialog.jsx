import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, XIcon } from "lucide-react";
import "./HeroVideoDialog.css";

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className = "",
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const animationVariants = {
    "from-center": {
      initial: { scale: 0.5, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.5, opacity: 0 },
    },
    "from-bottom": {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
    }
  };

  const selectedAnimation = animationVariants[animationStyle] || animationVariants["from-center"];

  useEffect(() => {
    if (!isVideoOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsVideoOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVideoOpen]);

  return (
    <div className={`hero-video-wrapper ${className}`}>
      <div
        className="hero-video-thumbnail-container"
        onClick={() => setIsVideoOpen(true)}
      >
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          className="hero-video-thumbnail"
          loading="lazy"
          decoding="async"
        />
        <div className="hero-video-play-overlay">
          <div className="hero-video-play-btn">
            <Play className="hero-video-play-icon" />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hero-video-modal-backdrop"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="hero-video-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="hero-video-small-close-btn"
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close video"
              >
                <XIcon size={16} />
              </button>
              <div className="hero-video-iframe-container">
                <iframe
                  src={videoSrc}
                  className="hero-video-iframe"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
