"use client";

import Image from "next/image";
import { useState } from "react";

type BlogImageGalleryProps = {
  articleTitle: string;
  images: string[];
};

export function BlogImageGallery({ articleTitle, images }: BlogImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return <span className="mono label">[ NO_IMAGE_DATA ]</span>;
  }

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <>
      <button className="btn btn-outline-teal" onClick={() => setIsOpen(true)} type="button">
        View images
      </button>
      {isOpen ? (
        <div aria-label={articleTitle} aria-modal="true" className="blog-modal" role="dialog">
          <button
            aria-label="Close image viewer"
            className="blog-modal-backdrop"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className="blog-modal-dialog">
            <div className="blog-modal-header">
              <p className="breadcrumb">{articleTitle}</p>
              <button
                aria-label="Close image viewer"
                className="blog-modal-close"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <div className="blog-modal-stage">
              <Image
                alt={`${articleTitle} image ${activeIndex + 1}`}
                className="blog-slide-image"
                fill
                sizes="(max-width: 960px) 100vw, 960px"
                src={images[activeIndex]}
              />
            </div>
            <div className="blog-modal-footer">
              <span className="terminal-meta">
                {activeIndex + 1} / {images.length}
              </span>
              {images.length > 1 ? (
                <div className="blog-modal-nav">
                  <button className="btn btn-outline-teal" onClick={showPrevious} type="button">
                    Prev
                  </button>
                  <button className="btn btn-outline-teal" onClick={showNext} type="button">
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}