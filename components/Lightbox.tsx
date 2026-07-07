"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Lightbox({ isOpen, onClose, src, alt }: { isOpen: boolean; onClose: () => void; src?: string; alt?: string; }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          // 'fixed inset-0' + 'z-[9999]' to cover entire screen
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111]/40 backdrop-blur-[5px] cursor-zoom-out"
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()} 
            className="max-w-[90%] max-h-[90vh] rounded-2xl shadow-2xl object-contain cursor-default border border-[2px] border-white"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // This sends the HTML to the bottom of the body
  );
}