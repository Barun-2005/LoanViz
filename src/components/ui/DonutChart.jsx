import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../contexts/LocaleContext';

const DonutChart = ({
  data,
  size = 180,
  thickness = 24,
  colors = ['#3B82F6', '#6366F1'],
  labels = [],
  animate = true,
  className = '',
  labelFontSize = 12,
  valueFontSize = 14,
  valuePosition = 'inside',
  monthlyPayment = null,
  totalRepayment = null
}) => {
  const { currentLocale } = useLocale();

  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [visibleSegments, setVisibleSegments] = useState(data.map((_, i) => true));

  const total = data.reduce((sum, value, index) =>
    sum + (visibleSegments[index] ? value : 0), 0);

  const percentages = data.map((value, index) =>
    visibleSegments[index] ? (value / total) * 100 : 0);

  const formattedTotal = total.toLocaleString();
  const [wholePart, decimalPart] = formattedTotal.includes('.')
    ? formattedTotal.split('.')
    : [formattedTotal, null];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness / 2 - 4; // Add padding to prevent edge clipping

    ctx.clearRect(0, 0, size, size);

    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.6,
      centerX, centerY, radius * 1.3
    );

    if (document.documentElement.classList.contains('dark')) {
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

    const bgStrokeGradient = ctx.createLinearGradient(0, 0, size, size);

    if (document.documentElement.classList.contains('dark')) {
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

    const animateSegments = (progress) => {
      let startAngle = -0.5 * Math.PI; // Start at top (12 o'clock position)
      let visibleDataCount = 0;

      data.forEach((_, index) => {
        if (visibleSegments[index]) {
          visibleDataCount++;
        }
      });

      data.forEach((value, index) => {
        if (!visibleSegments[index]) {
          return;
        }

        const segmentAngle = (value / total) * (2 * Math.PI) * progress;
        const endAngle = startAngle + segmentAngle;

        const gradient = ctx.createLinearGradient(
          centerX - radius, centerY - radius,
          centerX + radius, centerY + radius
        );

        const baseColor = colors[index % colors.length];
        const lighterColor = baseColor.replace(/rgb\((\d+), (\d+), (\d+)\)/, (_, r, g, b) =>
          `rgba(${Math.min(parseInt(r) + 60, 255)}, ${Math.min(parseInt(g) + 60, 255)}, ${Math.min(parseInt(b) + 60, 255)}, 0.95)`
        );
        const midColor = baseColor.replace(/rgb\((\d+), (\d+), (\d+)\)/, (_, r, g, b) =>
          `rgba(${Math.min(parseInt(r) + 30, 255)}, ${Math.min(parseInt(g) + 30, 255)}, ${Math.min(parseInt(b) + 30, 255)}, 0.9)`
        );

        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, midColor); // Add middle stop for smoother gradient
        gradient.addColorStop(1, lighterColor);

        const isHovered = hoveredSegment === index;

        const hoverOffset = isHovered ? thickness * 0.15 : 0;
        const segmentRadius = radius + hoverOffset;

        ctx.beginPath();
        ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
        ctx.lineWidth = thickness + (isHovered ? thickness * 0.2 : 0);
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;

        ctx.shadowColor = baseColor;
        ctx.shadowBlur = isHovered ? 15 : 10;
        ctx.shadowOffsetX = isHovered ? 2 : 1;
        ctx.shadowOffsetY = isHovered ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        if (isHovered) {
          const midAngle = startAngle + segmentAngle / 2;
          const tooltipX = centerX + Math.cos(midAngle) * (radius + thickness);
          const tooltipY = centerY + Math.sin(midAngle) * (radius + thickness);

          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          if (document.documentElement.classList.contains('dark')) {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
          }

          ctx.font = `bold ${labelFontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = baseColor;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(tooltipX, tooltipY);
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        startAngle = endAngle;
      });

      const innerRadius = radius - thickness / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);

      const innerGradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius * 0.5,
        centerX, centerY, innerRadius
      );

      if (document.documentElement.classList.contains('dark')) {
        innerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.02)');
        innerGradient.addColorStop(1, 'rgba(30, 41, 59, 0.05)');
      } else {
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      }

      ctx.fillStyle = innerGradient;
      ctx.fill();
    };

    let startTime = null;
    const duration = 1500;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + thickness/2, 0, 2 * Math.PI);
      ctx.fillStyle = bgGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = bgStrokeGradient;
      ctx.stroke();

      animateSegments(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsVisible(true);
      }
    };

    requestAnimationFrame(animate);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= radius - thickness/2 && distance <= radius + thickness/2) {
        let angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        let startAngle = 0;
        let hoveredIndex = null;

        for (let i = 0; i < data.length; i++) {
          if (!visibleSegments[i]) continue;

          const segmentAngle = (data[i] / total) * (2 * Math.PI);
          if (angle >= startAngle && angle <= startAngle + segmentAngle) {
            hoveredIndex = i;
            break;
          }
          startAngle += segmentAngle;
        }

        setHoveredSegment(hoveredIndex);
      } else {
        setHoveredSegment(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredSegment(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      startTime = null;
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data, size, thickness, colors, total, hoveredSegment, visibleSegments]);

  const chartVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -15,
      filter: "drop-shadow(0px 0px 0px rgba(0, 0, 0, 0))"
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))",
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.08,
      rotate: 5,
      filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.25))",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 15
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

  return (
    <div className={`chart-wrapper ${className} w-full flex flex-col items-center justify-center`} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <motion.div
        className="chart-container relative mx-auto"
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
              className="bg-white/90 dark:bg-gray-800/90 rounded-full w-3/5 h-3/5 flex flex-col items-center justify-center shadow-lg backdrop-blur-md border border-white/20 dark:border-gray-700/30"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                borderColor: "rgba(99, 102, 241, 0.3)"
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
                      className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200 bg-clip-text text-transparent"
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
                        <motion.div
                          className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200 bg-clip-text text-transparent flex items-center justify-center"
                          style={{ fontSize: `${valueFontSize * 1.2}px` }}
                          animate={{
                            scale: [1, 1.08, 1],
                            textShadow: [
                              "0 0 0px rgba(59, 130, 246, 0)",
                              "0 0 5px rgba(59, 130, 246, 0.5)",
                              "0 0 0px rgba(59, 130, 246, 0)"
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                        >
                          {currentLocale.currency}{monthlyPayment.toLocaleString()}
                        </motion.div>

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
                        <motion.div
                          className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200 bg-clip-text text-transparent flex items-center justify-center"
                          style={{ fontSize: `${valueFontSize * 1.2}px` }}
                          animate={{
                            scale: [1, 1.08, 1],
                            textShadow: [
                              "0 0 0px rgba(59, 130, 246, 0)",
                              "0 0 5px rgba(59, 130, 246, 0.5)",
                              "0 0 0px rgba(59, 130, 246, 0)"
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                        >
                          {wholePart}
                          {decimalPart && (
                            <motion.span
                              style={{ fontSize: `${valueFontSize * 0.9}px` }}
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                            >
                              .{decimalPart}
                            </motion.span>
                          )}
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Outside value display */}
      {valuePosition === 'outside' && (
        <motion.div
          className="mt-2 mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          <motion.div
            className="text-center bg-white/90 dark:bg-gray-800/90 rounded-xl py-1 px-3 shadow-md backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
              borderColor: "rgba(99, 102, 241, 0.3)"
            }}
          >
            <div
              className="text-gray-500 dark:text-gray-200 font-medium text-xs"
              style={{ fontSize: `${labelFontSize}px` }}
            >
              Total
            </div>
            <motion.div
              className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200 bg-clip-text text-transparent flex items-center justify-center"
              style={{ fontSize: `${valueFontSize * 1.2}px` }}
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 0px rgba(59, 130, 246, 0)",
                  "0 0 5px rgba(59, 130, 246, 0.5)",
                  "0 0 0px rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <motion.span
                className="currency-text-symbol mr-1"
                animate={{
                  y: [0, -1, 0],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {currentLocale.currency}
              </motion.span>
              {total.toLocaleString()}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Legend with toggle functionality */}
      {labels.length > 0 && (
        <motion.div
          className="chart-legend mt-1 w-full"
          initial="hidden"
          animate={isVisible && animate ? "visible" : "hidden"}
          variants={legendVariants}
          style={{ maxWidth: '100%' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-1">
            {labels.map((label, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-sm border cursor-pointer
                  ${visibleSegments[index]
                    ? 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700'
                    : 'bg-gray-100/90 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-60'
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
                style={{ margin: '2px' }}
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
                      ? 'text-gray-800 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
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

export default DonutChart;
