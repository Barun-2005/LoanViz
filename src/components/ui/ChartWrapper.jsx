import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { generateChartDescription, announceToScreenReader } from '../../utils/accessibilityUtils';
import { useLocale } from '../../contexts/LocaleContext';
import { formatCurrencyForChart } from '../../utils/formatUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Log that Chart.js is registered
console.log("Chart.js registered with components:", {
  CategoryScale: !!CategoryScale,
  LinearScale: !!LinearScale,
  PointElement: !!PointElement,
  LineElement: !!LineElement,
  BarElement: !!BarElement,
  ArcElement: !!ArcElement,
  Title: !!Title,
  Tooltip: !!Tooltip,
  Legend: !!Legend,
  Filler: !!Filler
});

/**
 * ChartWrapper component for rendering various chart types with animations
 * @param {Object} props - Component props
 * @param {string} props.type - Chart type ('line', 'bar', 'pie', 'doughnut')
 * @param {Object} props.data - Chart data
 * @param {Object} props.options - Chart options
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.height - Chart height
 * @param {number} props.width - Chart width
 * @param {boolean} props.animate - Whether to animate the chart
 * @returns {JSX.Element} Chart component
 */
const ChartWrapper = ({
  type = 'line',
  data,
  options = {},
  className = '',
  height,
  width,
  animate = true,
  title = '',
  description = '',
  formatYAxisAsCurrency = false,
  formatTooltipAsCurrency = false,
}) => {
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [chartData, setChartData] = useState(data);

  // Get locale information for currency formatting
  const { currentLocale, formatCurrency, formatChartCurrency } = useLocale();

  // Default chart options with animations and responsive design
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animate ? 1000 : 0,
      easing: 'easeOutQuart',
    },
    // Ensure chart has enough space for labels
    layout: {
      padding: {
        bottom: 10
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 12,
        },
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
      },
    },
    scales: type === 'line' || type === 'bar' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          borderDash: [2, 4],
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
          },
        },
      },
    } : undefined,
  };

  // Add currency formatting to tooltip if requested
  if (formatTooltipAsCurrency) {
    defaultOptions.plugins.tooltip.callbacks = {
      ...(defaultOptions.plugins.tooltip.callbacks || {}),
      label: function(context) {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        if (context.parsed.y !== null) {
          label += formatChartCurrency(context.parsed.y);
        }
        return label;
      }
    };
  }

  // Add currency formatting to y-axis if requested
  if (formatYAxisAsCurrency && type === 'line' || type === 'bar') {
    if (!defaultOptions.scales.y.ticks) {
      defaultOptions.scales.y.ticks = {};
    }
    defaultOptions.scales.y.ticks.callback = function(value) {
      return formatChartCurrency(value);
    };
  }

  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
    scales: type === 'line' || type === 'bar' ? {
      ...defaultOptions.scales,
      ...(options.scales || {}),
    } : undefined,
  };

  // Set chart data when data prop changes
  useEffect(() => {
    if (data) {
      console.log('ChartWrapper: Setting chart data', data);
      setChartData(data);
    } else {
      console.log('ChartWrapper: No data provided');
    }
  }, [data]);

  // Set visibility after component mounts and announce to screen readers
  useEffect(() => {
    setIsVisible(true);

    // Generate chart description for screen readers
    if (chartData) {
      const chartTitle = title || (options.plugins?.title?.text) || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`;
      const chartDescription = description || generateChartDescription(chartData, type, chartTitle);

      // Announce chart to screen readers
      announceToScreenReader(`Chart loaded: ${chartTitle}. ${chartDescription}`, 'polite');
    }
  }, [chartData, type, title, description, options.plugins?.title?.text]);

  // Animation variants
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      }
    }
  };

  // Render the appropriate chart type
  const renderChart = () => {
    // If chartData is null or undefined, return a placeholder
    if (!chartData) {
      console.log("ChartWrapper: No chart data available");
      return (
        <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart data is loading...</p>
        </div>
      );
    }

    console.log("ChartWrapper: Rendering chart of type:", type);
    console.log("ChartWrapper: Chart data:", chartData);
    console.log("ChartWrapper: Chart options:", mergedOptions);

    try {
      switch (type) {
        case 'line':
          return <Line ref={chartRef} data={chartData} options={mergedOptions} />;
        case 'bar':
          return <Bar ref={chartRef} data={chartData} options={mergedOptions} />;
        case 'pie':
          return <Pie ref={chartRef} data={chartData} options={mergedOptions} />;
        case 'doughnut':
          return <Doughnut ref={chartRef} data={chartData} options={mergedOptions} />;
        default:
          return <Line ref={chartRef} data={chartData} options={mergedOptions} />;
      }
    } catch (error) {
      console.error("ChartWrapper: Error rendering chart:", error);
      return (
        <div className="flex items-center justify-center h-full w-full bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-500 dark:text-red-400">Error rendering chart: {error.message}</p>
        </div>
      );
    }
  };

  // Generate accessible description
  const chartTitle = title || (options.plugins?.title?.text) || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`;
  const accessibleDescription = description || generateChartDescription(chartData, type, chartTitle);

  return (
    <motion.div
      className={`chart-container ${className}`}
      style={{
        height,
        width,
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={chartVariants}
      role="figure"
      aria-label={chartTitle}
      aria-describedby={`chart-desc-${chartRef.current?.id || Math.random().toString(36).substring(2, 9)}`}
    >
      {/* Hidden description for screen readers */}
      <div
        id={`chart-desc-${chartRef.current?.id || Math.random().toString(36).substring(2, 9)}`}
        className="sr-only"
      >
        {accessibleDescription}
      </div>

      {renderChart()}
    </motion.div>
  );
};

export default ChartWrapper;
