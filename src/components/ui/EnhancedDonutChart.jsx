import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * EnhancedDonutChart component with advanced animations and visual effects
 * @param {Object} props - Component props
 * @param {Array<number>} props.data - Array of numeric values for chart segments
 * @param {number} props.size - Size of the chart in pixels
 * @param {number} props.thickness - Thickness of the donut ring
 * @param {Array<string>} props.colors - Array of colors for chart segments
 * @param {Array<string>} props.labels - Array of labels for chart segments
 * @param {boolean} props.animate - Whether to animate the chart
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.labelFontSize - Font size for labels
 * @param {number} props.valueFontSize - Font size for values
 * @param {string} props.valuePosition - Position of the value ('inside' or 'outside')
 * @param {number} props.monthlyPayment - Monthly payment amount to display
 * @param {number} props.totalRepayment - Total repayment amount to display
 * @param {string} props.effect - Visual effect ('none', 'glow', 'pulse', 'neon')
 * @returns {JSX.Element} Enhanced donut chart component
 */
const EnhancedDonutChart = ({
  data,
  size = 220,
  thickness = 32,
  colors = ['#3B82F6', '#6366F1', '#9CA3AF'],
  labels = [],
  animate = true,
  className = '',
  labelFontSize = 13,
  valueFontSize = 18,
  valuePosition = 'inside',
  monthlyPayment = null,
  totalRepayment = null,
  effect = 'glow'
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [visibleSegments, setVisibleSegments] = useState(data.map((_, i) => true));
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Calculate total value based on visible segments only
  const total = data.reduce((sum, value, index) =>
    sum + (visibleSegments[index] ? value : 0), 0);

  // Calculate percentages for visible segments
  const percentages = data.map((value, index) =>
    visibleSegments[index] ? (value / total) * 100 : 0);

  // Format the total for display
  const formattedTotal = total.toLocaleString();

  // Split the formatted total into parts for better styling
  const [wholePart, decimalPart] = formattedTotal.includes('.')
    ? formattedTotal.split('.')
    : [formattedTotal, null];

  // Effect to handle initial render flag
  useEffect(() => {
    if (isInitialRender) {
      setTimeout(() => setIsInitialRender(false), 1500);
    }
  }, [isInitialRender]);

  // Track theme changes
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Main chart drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness / 2 - 4; // Add padding to prevent edge clipping

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Add gradient background with improved visual depth
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.6,
      centerX, centerY, radius * 1.3
    );

    if (isDarkMode) {
      bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.1)');
      bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.25)');
    } else {
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      bgGradient.addColorStop(1, 'rgba(229, 231, 235, 0.25)');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + thickness/2, 0, 2 * Math.PI);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // Draw background circle with improved gradient
    const bgStrokeGradient = ctx.createLinearGradient(0, 0, size, size);

    if (isDarkMode) {
      bgStrokeGradient.addColorStop(0, 'rgba(30, 41, 59, 0.3)');
      bgStrokeGradient.addColorStop(1, 'rgba(30, 41, 59, 0.1)');
    } else {
      bgStrokeGradient.addColorStop(0, 'rgba(229, 231, 235, 0.5)');
      bgStrokeGradient.addColorStop(1, 'rgba(229, 231, 235, 0.2)');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = bgStrokeGradient;
    ctx.stroke();

    // Create animation function for drawing segments with enhanced visuals
    const animateSegments = (progress) => {
      // Draw data segments with animation
      let startAngle = -0.5 * Math.PI; // Start at top (12 o'clock position)
      let visibleDataCount = 0;

      // First pass to calculate total angle for visible segments
      data.forEach((_, index) => {
        if (visibleSegments[index]) {
          visibleDataCount++;
        }
      });

      data.forEach((value, index) => {
        // Skip invisible segments
        if (!visibleSegments[index]) {
          return;
        }

        // Calculate segment angle based on visible data
        const segmentAngle = (value / total) * (2 * Math.PI) * progress;
        const endAngle = startAngle + segmentAngle;

        // Create enhanced gradient for segment
        const gradient = ctx.createLinearGradient(
          centerX - radius, centerY - radius,
          centerX + radius, centerY + radius
        );

        // Get base color and create a lighter version with improved contrast
        const baseColor = colors[index % colors.length];

        // Create a more vibrant lighter color for better visual appeal
        const lighterColor = baseColor.replace(/rgb\((\d+), (\d+), (\d+)\)/, (_, r, g, b) =>
          `rgba(${Math.min(parseInt(r) + 60, 255)}, ${Math.min(parseInt(g) + 60, 255)}, ${Math.min(parseInt(b) + 60, 255)}, 0.95)`
        );

        // Create a middle color for smoother gradient
        const midColor = baseColor.replace(/rgb\((\d+), (\d+), (\d+)\)/, (_, r, g, b) =>
          `rgba(${Math.min(parseInt(r) + 30, 255)}, ${Math.min(parseInt(g) + 30, 255)}, ${Math.min(parseInt(b) + 30, 255)}, 0.9)`
        );

        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, midColor); // Add middle stop for smoother gradient
        gradient.addColorStop(1, lighterColor);

        // Determine if this segment is hovered
        const isHovered = hoveredSegment === index;

        // Expand segment slightly if hovered
        const hoverOffset = isHovered ? thickness * 0.15 : 0;
        const segmentRadius = radius + hoverOffset;

        // Draw segment with improved styling
        ctx.beginPath();
        ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
        ctx.lineWidth = thickness + (isHovered ? thickness * 0.2 : 0);
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;

        // Enhanced shadow for better depth perception
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = isHovered ? 15 : 10;
        ctx.shadowOffsetX = isHovered ? 2 : 1;
        ctx.shadowOffsetY = isHovered ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        startAngle = endAngle;
      });

      // Draw inner circle (for donut hole) with subtle gradient
      const innerRadius = radius - thickness / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);

      // Create subtle inner gradient for better visual depth
      const innerGradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius * 0.5,
        centerX, centerY, innerRadius
      );

      if (isDarkMode) {
        innerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.02)');
        innerGradient.addColorStop(1, 'rgba(30, 41, 59, 0.05)');
      } else {
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      }

      ctx.fillStyle = innerGradient;
      ctx.fill();
    };

    // Animate the drawing of segments with guaranteed full rotation
    let startTime = null;
    const duration = 3500; // 3.5 second animation for a much smoother effect

    // Custom easing function that ensures full rotation
    const customEasing = t => {
      // Ensure we complete at least one full rotation
      // This function will progress more slowly at the beginning and accelerate towards the end
      return Math.pow(t, 1.5); // Power easing - starts slower, ends faster
    };

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Apply custom easing for smoother animation that ensures full rotation
      const progress = customEasing(rawProgress);

      // Clear only the area where segments will be drawn
      ctx.clearRect(0, 0, size, size);

      // Redraw background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + thickness/2, 0, 2 * Math.PI);
      ctx.fillStyle = bgGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = bgStrokeGradient;
      ctx.stroke();

      // Draw segments with current progress
      animateSegments(progress);

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure we set visible only after the animation is truly complete
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }
    };

    requestAnimationFrame(animate);

    // Add event listener for mouse movement to detect hovering over segments
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if mouse is within the donut area
      if (distance >= radius - thickness/2 && distance <= radius + thickness/2) {
        // Calculate angle
        let angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        // Find which segment the angle corresponds to
        let startAngle = 0;
        let hoveredIndex = null;

        for (let i = 0; i < data.length; i++) {
          if (!visibleSegments[i]) continue;

          const segmentAngle = (data[i] / total) * (2 * Math.PI);
          if (angle >= startAngle && angle <= startAngle + segmentAngle) {
            hoveredIndex = i;

            // Set tooltip info
            const midAngle = startAngle + segmentAngle / 2;
            const tooltipX = centerX + Math.cos(midAngle - Math.PI / 2) * (radius + thickness / 2 + 20);
            const tooltipY = centerY + Math.sin(midAngle - Math.PI / 2) * (radius + thickness / 2 + 20);

            setTooltipInfo({
              index: i,
              x: tooltipX,
              y: tooltipY,
              value: data[i],
              percentage: percentages[i],
              label: labels[i] || `Segment ${i + 1}`
            });

            break;
          }
          startAngle += segmentAngle;
        }

        setHoveredSegment(hoveredIndex);
      } else {
        setHoveredSegment(null);
        setTooltipInfo(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredSegment(null);
      setTooltipInfo(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      startTime = null;
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data, size, thickness, colors, total, hoveredSegment, visibleSegments, percentages, labels, isDarkMode]);

  // Animation variants - slowed down and smoother
  const chartVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -15,
      filter: "drop-shadow(0px 0px 0px rgba(0, 0, 0, 0))" // Initialize with a valid filter
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))", // Set initial visible filter
      transition: {
        duration: 1.5, // Increased duration
        ease: "easeInOut", // Smoother easing
        type: "spring",
        stiffness: 60, // Reduced stiffness for smoother animation
        damping: 15 // Increased damping
      }
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.25))",
      transition: {
        duration: 0.6, // Slightly longer hover transition
        ease: "easeOut",
        type: "spring",
        stiffness: 200, // Reduced stiffness
        damping: 20 // Increased damping
      }
    }
  };

  const legendVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  // Get effect classes based on the effect prop
  const getEffectClasses = () => {
    // Removed shadow effects to prevent square container appearance
    switch (effect) {
      case 'glow':
        return ''; // Removed 'shadow-glow dark:shadow-glow-dark'
      case 'pulse':
        return 'animate-pulse-subtle';
      case 'neon':
        return 'animate-neon-pulse';
      default:
        return '';
    }
  };

  return (
    <div className={`chart-wrapper ${className} w-full flex flex-col items-center justify-center`} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <motion.div
        className={`chart-container relative mx-auto ${getEffectClasses()}`}
        initial="hidden"
        animate={isVisible && animate ? "visible" : "hidden"}
        whileHover="hover"
        variants={chartVariants}
        style={{ width: `${size}px`, height: `${size}px`, maxWidth: '100%' }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="chart-canvas"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%', // Ensure the canvas is perfectly round
            transition: 'all 0.3s ease'
          }}
        />

        {/* Enhanced center text with background and additional payment info */}
        {valuePosition === 'inside' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <motion.div
              className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} rounded-full w-3/5 h-3/5 flex flex-col items-center justify-center backdrop-blur-md`}
              whileHover={{
                scale: 1.05
              }}
            >
              <AnimatePresence mode="wait">
                {hoveredSegment !== null ? (
                  <motion.div
                    key="segment"
                    className="text-center"
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                  >
                    <motion.div
                      className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200"
                      style={{ fontSize: `${valueFontSize * 1.2}px` }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {percentages[hoveredSegment].toFixed(1)}%
                    </motion.div>
                    <div
                      className="text-gray-600 dark:text-gray-300 font-medium"
                      style={{ fontSize: `${labelFontSize}px` }}
                    >
                      {labels[hoveredSegment] || `Segment ${hoveredSegment + 1}`}
                    </div>
                    <div
                      className="text-gray-500 dark:text-gray-400 text-xs mt-1"
                    >
                      {currentLocale.currency}{data[hoveredSegment].toLocaleString()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    className="text-center"
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                  >
                    {monthlyPayment ? (
                      <>
                        <div
                          className="text-blue-600 dark:text-blue-400 font-medium"
                          style={{ fontSize: `${labelFontSize}px` }}
                        >
                          Monthly Payment
                        </div>
                        <AnimatedNumber
                          value={monthlyPayment}
                          prefix={currentLocale.currency}
                          decimals={2}
                          size="lg"
                          color="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200"
                          effect="gradient"
                          separateDigits={isInitialRender}
                          easing="expo"
                          highlightChange={true}
                          className="font-bold"
                        />

                        <div className="mt-1 border-t border-gray-200 dark:border-gray-700 pt-1 w-4/5 mx-auto">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Total:</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{currentLocale.currency}{total.toLocaleString()}</span>
                          </div>
                          {totalRepayment && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Repayment:</span>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{currentLocale.currency}{totalRepayment.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="text-gray-500 dark:text-gray-400 font-medium"
                          style={{ fontSize: `${labelFontSize}px` }}
                        >
                          Total
                        </div>
                        <AnimatedNumber
                          value={total}
                          prefix={currentLocale.currency}
                          decimals={0}
                          size="lg"
                          color="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200"
                          effect="gradient"
                          separateDigits={isInitialRender}
                          easing="expo"
                          className="font-bold"
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip for hovered segment */}
      <AnimatePresence>
        {tooltipInfo && (
          <motion.div
            className={`absolute z-50 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-md rounded-lg shadow-lg border p-2 text-center`}
            style={{
              left: `${tooltipInfo.x}px`,
              top: `${tooltipInfo.y}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-bold text-sm" style={{ color: colors[tooltipInfo.index % colors.length] }}>
              {tooltipInfo.label}
            </div>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>
              {currentLocale.currency}{tooltipInfo.value.toLocaleString()} ({tooltipInfo.percentage.toFixed(1)}%)
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend with toggle functionality */}
      {labels.length > 0 && (
        <motion.div
          className="chart-legend mt-3 w-full"
          initial="hidden"
          animate={isVisible && animate ? "visible" : "hidden"}
          variants={legendVariants}
          style={{ maxWidth: '100%' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {labels.map((label, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm border cursor-pointer
                  ${visibleSegments[index]
                    ? isDarkMode
                      ? 'bg-gray-800/90 border-gray-700'
                      : 'bg-white/90 border-gray-200'
                    : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 opacity-60'
                      : 'bg-gray-100/90 border-gray-300 opacity-60'
                  }`}
                onClick={() => {
                  // Toggle this segment's visibility
                  const newVisibleSegments = [...visibleSegments];
                  newVisibleSegments[index] = !newVisibleSegments[index];
                  setVisibleSegments(newVisibleSegments);
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: visibleSegments[index]
                    ? (index === 0
                      ? 'rgba(59, 130, 246, 0.15)'
                      : index === 1
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(156, 163, 175, 0.15)')
                    : 'rgba(209, 213, 219, 0.3)',
                  borderColor: visibleSegments[index] ? colors[index % colors.length] : 'rgba(209, 213, 219, 0.5)',
                  boxShadow: visibleSegments[index] ? `0 4px 12px ${colors[index % colors.length]}40` : 'none',
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full flex items-center justify-center`}
                  style={{
                    backgroundColor: visibleSegments[index]
                      ? colors[index % colors.length]
                      : 'rgba(209, 213, 219, 0.5)'
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={visibleSegments[index] ? {
                    boxShadow: [
                      `0 0 0px ${colors[index % colors.length]}00`,
                      `0 0 5px ${colors[index % colors.length]}90`,
                      `0 0 0px ${colors[index % colors.length]}00`
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  {!visibleSegments[index] && (
                    <motion.div
                      className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    />
                  )}
                </motion.div>
                <motion.div
                  className={`font-medium text-xs ${
                    visibleSegments[index]
                      ? isDarkMode ? 'text-white' : 'text-gray-800'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  style={{ fontSize: `${labelFontSize - 1}px` }}
                  whileHover={{
                    scale: 1.05,
                    color: visibleSegments[index] ? colors[index % colors.length] : 'currentColor'
                  }}
                >
                  {label}
                  {visibleSegments[index] && data[index] && (
                    <span className="ml-1 text-xs opacity-70">
                      ({percentages[index].toFixed(1)}%)
                    </span>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedDonutChart;
