import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation periodically to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle theme toggle with animation
  const handleToggleTheme = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <motion.button
      onClick={handleToggleTheme}
      className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden
                 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-indigo-900 dark:to-blue-950
                 shadow-[0_0_10px_rgba(59,130,246,0.5)] sm:shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_10px_rgba(99,102,241,0.5)] dark:sm:shadow-[0_0_15px_rgba(99,102,241,0.5)]
                 border-2 border-blue-200 dark:border-indigo-700
                 hover:shadow-[0_0_15px_rgba(59,130,246,0.7)] sm:hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] dark:hover:shadow-[0_0_15px_rgba(99,102,241,0.7)] dark:sm:hover:shadow-[0_0_20px_rgba(99,102,241,0.7)]
                 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
        rotate: isAnimating ? [0, 5, -5, 0] : 0,
      }}
      transition={{
        duration: isAnimating ? 1 : 0.3,
        ease: "easeInOut"
      }}
    >
      {/* Background gradient circle that rotates */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300/30 via-transparent to-blue-300/30 dark:from-indigo-500/30 dark:via-transparent dark:to-indigo-500/30"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-400/10 dark:bg-indigo-500/10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <AnimatePresence mode="wait">
        {isDarkMode ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: isHovered ? [0, 10, -10, 0] : [-2, 2, -2]
            }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{
              duration: 0.5,
              rotate: {
                duration: isHovered ? 3 : 6,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Cosmic background with warm colors */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(254,240,138,0.1) 0%, rgba(234,88,12,0.2) 100%)',
                  'radial-gradient(circle, rgba(254,240,138,0.2) 0%, rgba(234,88,12,0.3) 100%)',
                  'radial-gradient(circle, rgba(254,240,138,0.1) 0%, rgba(234,88,12,0.2) 100%)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            {/* Sun corona effect */}
            <motion.div
              className="absolute inset-[-15%] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0) 70%)'
              }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            {/* Sun with rays */}
            <div className="relative w-6 h-6 sm:w-7 sm:h-7">
              {/* Sun outer glow */}
              <motion.div
                className="absolute inset-[-40%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(251,191,36,0) 70%)'
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              {/* Main sun circle with animated gradient */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 15px 3px rgba(251, 191, 36, 0.7)',
                    '0 0 25px 5px rgba(251, 191, 36, 0.9)',
                    '0 0 15px 3px rgba(251, 191, 36, 0.7)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {/* Sun base */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400" />

                {/* Sun texture */}
                <motion.div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23FBBF24\' d=\'M44.5,-76.3C59.3,-69.9,74.1,-60.9,83.7,-47.3C93.3,-33.7,97.7,-16.8,95.9,-1.1C94.1,14.7,86.1,29.4,76.4,42.7C66.7,56,55.4,67.9,41.6,74.4C27.9,80.9,13.9,82,0.1,81.8C-13.8,81.7,-27.5,80.3,-40.3,74.7C-53.1,69.1,-64.9,59.3,-73.4,46.6C-82,33.9,-87.3,17,-87.9,-0.3C-88.5,-17.6,-84.5,-35.2,-75.3,-49.5C-66.1,-63.8,-51.8,-74.8,-36.8,-80.8C-21.8,-86.8,-5.4,-87.8,9.4,-84.5C24.2,-81.2,29.7,-82.7,44.5,-76.3Z\' transform=\'translate(100 100)\' /%3E%3C/svg%3E")',
                    backgroundSize: '120% 120%'
                  }}
                  animate={{
                    rotate: 360,
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{
                    rotate: {
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    backgroundPosition: {
                      duration: 10,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />

                {/* Sun surface animation */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)'
                  }}
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>

              {/* Rays container */}
              <motion.div
                className="absolute inset-[-100%]"
                animate={{
                  rotate: 360,
                  scale: isHovered ? [1, 1.1, 1] : 1
                }}
                transition={{
                  rotate: {
                    duration: isHovered ? 8 : 10,
                    repeat: Infinity,
                    ease: "linear"
                  },
                  scale: {
                    duration: 2,
                    repeat: isHovered ? Infinity : 0,
                    repeatType: "reverse"
                  }
                }}
              >
                {/* Generate 24 rays with different lengths and positions */}
                {[...Array(24)].map((_, i) => {
                  // Create different ray types
                  const rayType = i % 4;
                  const isLongRay = rayType === 0;
                  const isMediumRay = rayType === 1;
                  const isShortRay = rayType === 2;
                  const isTinyRay = rayType === 3;

                  // Set ray properties based on type
                  const rayLength = isLongRay ? '50%' : isMediumRay ? '40%' : isShortRay ? '30%' : '20%';
                  const rayWidth = isLongRay ? '2px' : isMediumRay ? '1.5px' : isShortRay ? '1px' : '0.5px';
                  const rayDistance = isLongRay ? '100%' : isMediumRay ? '90%' : isShortRay ? '80%' : '70%';
                  const rayOpacity = isLongRay ? 0.9 : isMediumRay ? 0.7 : isShortRay ? 0.5 : 0.3;

                  // Create gradient colors based on ray type
                  const fromColor = isLongRay ? 'yellow-300' : isMediumRay ? 'amber-300' : isShortRay ? 'yellow-200' : 'amber-200';
                  const toColor = isLongRay ? 'amber-200' : isMediumRay ? 'yellow-200' : isShortRay ? 'amber-100' : 'yellow-100';

                  return (
                    <motion.div
                      key={`ray-${i}`}
                      className={`absolute bg-gradient-to-t from-${fromColor} to-${toColor} rounded-full`}
                      style={{
                        width: rayWidth,
                        height: rayLength,
                        left: 'calc(50% - 1px)',
                        top: '50%',
                        opacity: rayOpacity,
                        transformOrigin: 'center bottom',
                        transform: `rotate(${i * 15}deg) translateY(-${rayDistance})`,
                      }}
                      animate={{
                        height: [rayLength, `calc(${rayLength} + ${isLongRay ? '20%' : isMediumRay ? '15%' : '10%'})`, rayLength],
                        opacity: [rayOpacity * 0.7, rayOpacity, rayOpacity * 0.7]
                      }}
                      transition={{
                        duration: 2 + (i % 6) * 0.3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05,
                      }}
                    />
                  );
                })}
              </motion.div>

              {/* Sun inner glow */}
              <motion.div
                className="absolute inset-[15%] rounded-full bg-yellow-100/70"
                animate={{
                  scale: [0.8, 1, 0.8],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              {/* Sun flare effect on hover */}
              {isHovered && (
                <motion.div
                  className="absolute inset-[-50%] opacity-70"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)'
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.7, 0.3],
                    rotate: [0, 180]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: isHovered ? [-5, 5, -5] : [-2, 2, -2]
            }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{
              duration: 0.5,
              rotate: {
                duration: isHovered ? 2 : 6,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Cosmic background with nebula effect */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(49,46,129,1) 100%)',
                  'radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(67,56,202,0.8) 100%)',
                  'radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(49,46,129,1) 100%)'
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {/* Nebula clouds */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%238B5CF6\' d=\'M44.9,-76.2C59.7,-69.2,74.4,-60.4,83.3,-47.1C92.2,-33.8,95.3,-16.9,93.2,-1.2C91.1,14.5,83.8,29,74.2,41.3C64.6,53.5,52.7,63.5,39.4,70.1C26.1,76.7,11.5,79.9,-2.9,84.3C-17.3,88.7,-31.5,94.3,-43.7,90.7C-55.9,87.1,-66,74.3,-74.8,60.5C-83.6,46.7,-91.1,31.8,-93.9,15.8C-96.7,-0.3,-94.8,-17.5,-88.9,-33.1C-83,-48.7,-73.1,-62.7,-59.6,-70.4C-46.1,-78.1,-29,-79.5,-13.8,-76.9C1.5,-74.3,30.1,-83.2,44.9,-76.2Z\' transform=\'translate(100 100)\' /%3E%3C/svg%3E")',
                  backgroundSize: '400% 400%'
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.div>

            {/* Animated cosmic dust particles */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: isHovered ? 15 : 30,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Generate cosmic dust particles */}
              {[...Array(30)].map((_, i) => {
                const size = Math.max(0.8, Math.random() * 2);
                const distance = 20 + Math.random() * 60; // % from center
                const angle = (i * 12) + (Math.random() * 10); // degrees
                const x = Math.cos(angle * Math.PI / 180) * distance;
                const y = Math.sin(angle * Math.PI / 180) * distance;
                const colors = ['#E0F2FE', '#BFDBFE', '#93C5FD', '#A5B4FC', '#C4B5FD', '#DDD6FE'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                return (
                  <motion.div
                    key={`dust-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `calc(50% + ${x}%)`,
                      top: `calc(50% + ${y}%)`,
                      backgroundColor: color,
                      transformOrigin: 'center',
                    }}
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.8, 1.5, 0.8],
                      boxShadow: [
                        `0 0 0px ${color}00`,
                        `0 0 4px ${color}`,
                        `0 0 0px ${color}00`
                      ]
                    }}
                    transition={{
                      duration: 1 + Math.random() * 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.05,
                    }}
                  />
                );
              })}
            </motion.div>

            {/* Animated stars */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{
                duration: isHovered ? 20 : 40,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Generate stars with different sizes and positions */}
              {[...Array(15)].map((_, i) => {
                const size = Math.max(1.2, Math.random() * 2.8);
                const distance = 30 + Math.random() * 40; // % from center
                const angle = (i * 24) + (Math.random() * 10); // degrees
                const x = Math.cos(angle * Math.PI / 180) * distance;
                const y = Math.sin(angle * Math.PI / 180) * distance;

                return (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `calc(50% + ${x}%)`,
                      top: `calc(50% + ${y}%)`,
                      transformOrigin: 'center',
                    }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.5, 1],
                      boxShadow: [
                        '0 0 0px rgba(255, 255, 255, 0)',
                        '0 0 5px rgba(255, 255, 255, 1)',
                        '0 0 0px rgba(255, 255, 255, 0)'
                      ]
                    }}
                    transition={{
                      duration: 1 + Math.random() * 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                  />
                );
              })}
            </motion.div>

            {/* Moon with animated glow */}
            <div className="relative w-6 h-6 sm:w-7 sm:h-7">
              {/* Outer glow effect */}
              <motion.div
                className="absolute inset-[-50%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(224,242,254,0.4) 0%, rgba(224,242,254,0) 70%)'
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              {/* Inner glow effect */}
              <motion.div
                className="absolute inset-[-25%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(224,242,254,0.6) 0%, rgba(224,242,254,0) 70%)'
                }}
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
              />

              {/* Main moon with animated gradient */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 10px 2px rgba(224, 242, 254, 0.7)',
                    '0 0 20px 4px rgba(224, 242, 254, 0.9)',
                    '0 0 10px 2px rgba(224, 242, 254, 0.7)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {/* Moon base */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100" />

                {/* Animated moon texture */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23CBD5E1\' d=\'M39.9,-65.7C54.1,-60.5,69.3,-53.7,77.9,-41.8C86.5,-30,88.5,-13,85.8,2.7C83.1,18.5,75.6,33,65.8,45.1C56,57.2,43.8,66.9,30.1,72.4C16.5,77.9,1.3,79.2,-13.4,76.8C-28.2,74.4,-42.5,68.3,-53.5,58.3C-64.5,48.3,-72.2,34.4,-77.7,19.1C-83.2,3.8,-86.5,-13,-82.9,-28.2C-79.3,-43.4,-68.8,-57,-55.2,-63.1C-41.6,-69.2,-24.9,-67.8,-9.5,-65.2C5.9,-62.6,25.7,-70.9,39.9,-65.7Z\' transform=\'translate(100 100)\' /%3E%3C/svg%3E")',
                    backgroundSize: '120% 120%'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />

                {/* Moon craters with animation */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: isHovered ? [0, 10, 0] : [0, 5, 0]
                  }}
                  transition={{
                    duration: isHovered ? 4 : 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {/* Crater 1 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-sky-200/80 top-1 left-1"
                    animate={{
                      opacity: [0.7, 0.9, 0.7],
                      boxShadow: [
                        'inset 0 0 2px rgba(148, 163, 184, 0.5)',
                        'inset 0 0 3px rgba(148, 163, 184, 0.8)',
                        'inset 0 0 2px rgba(148, 163, 184, 0.5)'
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  {/* Crater 2 */}
                  <motion.div
                    className="absolute w-1.5 h-1.5 rounded-full bg-sky-200/70 bottom-1 left-2"
                    animate={{
                      opacity: [0.6, 0.8, 0.6],
                      boxShadow: [
                        'inset 0 0 1px rgba(148, 163, 184, 0.5)',
                        'inset 0 0 2px rgba(148, 163, 184, 0.8)',
                        'inset 0 0 1px rgba(148, 163, 184, 0.5)'
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.5
                    }}
                  />

                  {/* Crater 3 */}
                  <motion.div
                    className="absolute w-2.5 h-2.5 rounded-full bg-sky-200/60 top-2 right-1"
                    animate={{
                      opacity: [0.5, 0.7, 0.5],
                      boxShadow: [
                        'inset 0 0 2px rgba(148, 163, 184, 0.5)',
                        'inset 0 0 3px rgba(148, 163, 184, 0.8)',
                        'inset 0 0 2px rgba(148, 163, 184, 0.5)'
                      ]
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Shooting star effect on hover */}
              {isHovered && (
                <motion.div
                  className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
                  style={{
                    top: '50%',
                    left: '-150%',
                    transformOrigin: 'center',
                    transform: 'rotate(-45deg)'
                  }}
                  animate={{
                    left: ['150%', '-150%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
