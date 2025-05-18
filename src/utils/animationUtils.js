// Framer Motion animation presets for consistent UI interactions

// Button animation variants
export const buttonAnimationVariants = {
  // Hover animation for buttons
  hover: {
    scale: 1.03,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  // Tap animation for buttons
  tap: {
    scale: 0.97,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15
    }
  },
  // Initial state
  initial: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  }
};

// Input field animation variants
export const inputAnimationVariants = {
  // Focus animation for input fields
  focus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.8)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  // Error animation for input fields
  error: {
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      x: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
        duration: 0.5
      }
    }
  },
  // Initial state
  initial: {
    boxShadow: 'none',
    borderColor: 'rgba(209, 213, 219, 1)'
  }
};

// Card animation variants
export const cardAnimationVariants = {
  // Hover animation for cards
  hover: {
    y: -5,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  },
  // Initial state
  initial: {
    y: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
  }
};

// Page transition variants
export const pageTransitionVariants = {
  // Initial state when entering
  initial: {
    opacity: 0,
    y: 20
  },
  // Animate state
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  // Exit state
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Staggered children animation variants
export const staggerChildrenVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Success animation variants
export const successAnimationVariants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

// Error animation variants
export const errorAnimationVariants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      scale: {
        type: 'spring',
        stiffness: 300,
        damping: 15
      },
      x: {
        duration: 0.5
      }
    }
  }
};

// Loading animation variants
export const loadingAnimationVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Tooltip animation variants
export const tooltipAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeIn"
    }
  }
};
