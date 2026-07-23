// frontend/src/constants/motionVariants.js

export const ENTERPRISE_EASE = [0.22, 1, 0.36, 1];

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: ENTERPRISE_EASE }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.25, ease: ENTERPRISE_EASE }
  }
};

export const cardHoverProps = {
  whileHover: { 
    y: -4, 
    scale: 1.02,
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

export const buttonHoverProps = {
  whileHover: { 
    scale: 1.03,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  whileTap: { 
    scale: 0.97,
    transition: { duration: 0.12, ease: "easeOut" }
  }
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.25, ease: ENTERPRISE_EASE }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export const drawerVariants = {
  initial: { x: "100%" },
  animate: { 
    x: 0,
    transition: { duration: 0.28, ease: ENTERPRISE_EASE }
  },
  exit: { 
    x: "100%",
    transition: { duration: 0.25, ease: "easeIn" }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const tableRowVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

export const iconRotateHover = {
  whileHover: { 
    rotate: 10, 
    scale: 1.1,
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

export const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.25, ease: ENTERPRISE_EASE }
  }
};
