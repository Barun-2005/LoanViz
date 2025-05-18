import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedBackground component for creating dynamic, animated backgrounds
 * @param {Object} props - Component props
 * @param {string} props.type - Type of animation ('waves', 'particles', 'blobs', 'grid')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Base color for the animation
 * @param {number} props.opacity - Opacity of the animation (0-100)
 * @param {boolean} props.interactive - Whether the animation should react to mouse movement
 * @param {string} props.gradientFrom - Starting gradient color (for gradient backgrounds)
 * @param {string} props.gradientTo - Ending gradient color (for gradient backgrounds)
 * @returns {JSX.Element} Animated background component
 */
const AnimatedBackground = ({
  type = 'waves',
  className = '',
  color = 'primary',
  opacity = 10,
  interactive = false,
  gradientFrom = '',
  gradientTo = '',
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Get color class based on the color prop
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'from-blue-500/10 to-indigo-500/5 dark:from-blue-600/10 dark:to-indigo-600/5';
      case 'secondary':
        return 'from-indigo-500/10 to-purple-500/5 dark:from-indigo-600/10 dark:to-purple-600/5';
      case 'success':
        return 'from-green-500/10 to-emerald-500/5 dark:from-green-600/10 dark:to-emerald-600/5';
      case 'warning':
        return 'from-amber-500/10 to-yellow-500/5 dark:from-amber-600/10 dark:to-yellow-600/5';
      case 'error':
        return 'from-red-500/10 to-rose-500/5 dark:from-red-600/10 dark:to-rose-600/5';
      case 'custom':
        return `${gradientFrom} ${gradientTo}`;
      default:
        return 'from-gray-200/10 to-gray-300/5 dark:from-gray-700/10 dark:to-gray-800/5';
    }
  };

  // Waves animation effect
  useEffect(() => {
    if (type === 'waves') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      let animationFrameId;
      let mouseX = 0;
      let mouseY = 0;

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      const handleMouseMove = (e) => {
        if (interactive) {
          const rect = canvas.getBoundingClientRect();
          mouseX = e.clientX - rect.left;
          mouseY = e.clientY - rect.top;
        }
      };

      const drawWaves = (timestamp) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDarkMode = document.documentElement.classList.contains('dark');
        const baseColor = isDarkMode ?
          (color === 'primary' ? '#3B82F6' : '#6366F1') :
          (color === 'primary' ? '#60A5FA' : '#818CF8');

        // Draw multiple waves with different properties
        for (let i = 0; i < 3; i++) {
          const amplitude = 15 - i * 3; // Decreasing amplitude for each wave
          const frequency = 0.02 + i * 0.01; // Increasing frequency for each wave
          const speed = 0.001 + i * 0.0005; // Increasing speed for each wave
          const waveOpacity = (0.1 - i * 0.03) * (opacity / 100); // Decreasing opacity for each wave

          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);

          for (let x = 0; x < canvas.width; x++) {
            // Calculate wave y position with time-based animation
            const y = canvas.height / 2 +
                     amplitude * Math.sin(x * frequency + timestamp * speed) +
                     (interactive ? amplitude * 0.5 * Math.sin((x - mouseX) * 0.01) : 0);

            ctx.lineTo(x, y);
          }

          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();

          // Create gradient fill
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, `${baseColor}${Math.round(waveOpacity * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${baseColor}00`);

          ctx.fillStyle = gradient;
          ctx.fill();
        }

        animationFrameId = requestAnimationFrame(drawWaves);
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      canvas.addEventListener('mousemove', handleMouseMove);

      animationFrameId = requestAnimationFrame(drawWaves);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        canvas.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [type, color, opacity, interactive]);

  // Render different background types
  const renderBackground = () => {
    switch (type) {
      case 'waves':
        return (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
        );

      case 'blobs':
        return (
          <>
            <motion.div
              className={`absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 filter blur-3xl animate-blob-move`}
              animate={{
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
                scale: [1, 1.05, 0.95, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 filter blur-3xl animate-blob-move`}
              animate={{
                x: [0, -10, 10, 0],
                y: [0, 10, -10, 0],
                scale: [1, 0.95, 1.05, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
            />
            <motion.div
              className={`absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-500/5 dark:bg-purple-500/10 filter blur-3xl animate-blob-spin`}
              animate={{
                rotate: [0, 360],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                rotate: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }
              }}
            />
          </>
        );

      case 'grid':
        return (
          <motion.div
            className="absolute inset-0 bg-grid-pattern opacity-5"
            animate={{
              backgroundPosition: ['0px 0px', '20px 20px'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "loop"
            }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233B82F6\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '20px 20px'
            }}
          />
        );

      default:
        return (
          <div className={`absolute inset-0 bg-gradient-to-br ${getColorClass()}`} />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity: opacity / 100 }}
    >
      {renderBackground()}
    </div>
  );
};

export default AnimatedBackground;
