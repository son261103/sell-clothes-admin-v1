// src/constants/animationVariants.ts
import { Variants } from 'framer-motion';

interface FadeInUpParams {
    y?: number;
    duration?: number;
    delay?: number;
}

interface SlideInParams {
    x?: number;
    y?: number;
    duration?: number;
    delay?: number;
}

interface ScaleParams {
    initialScale?: number;
    duration?: number;
    delay?: number;
}

// Basic fade animation with improved timing
export const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
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

// Enhanced modal animations with spring effects
export const modalAnimationVariants = {
    overlay: {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            transition: {
                delay: 0.2,
                duration: 0.3
            }
        }
    },
    modal: {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                duration: 0.5,
                bounce: 0.3
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            x: -200,
            transition: {
                type: "spring",
                duration: 0.4,
                bounce: 0.1
            }
        }
    },
    content: {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            y: 20,
            transition: {
                duration: 0.3
            }
        }
    },
    tabContent: {
        hidden: {
            opacity: 0,
            x: -20
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: {
                duration: 0.3
            }
        }
    }
};

// Customizable fade in up animation
export const createFadeInUpVariants = ({
                                           y = 20,
                                           duration = 0.3,
                                           delay = 0
                                       }: FadeInUpParams = {}): Variants => ({
    hidden: {
        opacity: 0,
        y
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            duration,
            delay,
            bounce: 0.2
        }
    },
    exit: {
        opacity: 0,
        y: y * -1,
        transition: {
            duration: duration / 2
        }
    }
});

// Enhanced slide in animation with spring effect
export const createSlideInVariants = ({
                                          x = 0,
                                          y = 0,
                                          duration = 0.3,
                                          delay = 0
                                      }: SlideInParams = {}): Variants => ({
    hidden: {
        opacity: 0,
        x,
        y
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
            type: "spring",
            duration,
            delay,
            bounce: 0.2
        }
    },
    exit: {
        opacity: 0,
        x: x * -1,
        y: y * -1,
        transition: {
            duration: duration / 2
        }
    }
});

// Scale animation with improved spring effect
export const createScaleVariants = ({
                                        initialScale = 0.95,
                                        duration = 0.3,
                                        delay = 0
                                    }: ScaleParams = {}): Variants => ({
    hidden: {
        opacity: 0,
        scale: initialScale
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            duration,
            delay,
            bounce: 0.2
        }
    },
    exit: {
        opacity: 0,
        scale: initialScale,
        transition: {
            duration: duration / 2
        }
    }
});

// Improved drawer animations
export const drawerVariants = {
    left: {
        hidden: { x: '-100%' },
        visible: {
            x: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 350
            }
        },
        exit: {
            x: '-100%',
            transition: {
                type: 'spring',
                duration: 0.4,
                bounce: 0
            }
        }
    },
    right: {
        hidden: { x: '100%' },
        visible: {
            x: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 350
            }
        },
        exit: {
            x: '100%',
            transition: {
                type: 'spring',
                duration: 0.4,
                bounce: 0
            }
        }
    }
};

// List item animations with stagger effect
export const listItemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            delay: custom * 0.1,
            duration: 0.4,
            bounce: 0.2
        }
    }),
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

// Enhanced dropdown animations
export const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: -10
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 20,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
            duration: 0.2
        }
    }
};