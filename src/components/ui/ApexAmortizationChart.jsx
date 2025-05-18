import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * ApexAmortizationChart - A component that displays amortization data using ApexCharts
 * @param {Object} props - Component props
 * @param {Array} props.schedule - Amortization schedule array
 * @returns {JSX.Element} ApexCharts amortization chart
 */
const ApexAmortizationChart = ({ schedule }) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // Process schedule data for the chart
  const processData = () => {
    if (!schedule || schedule.length === 0) {
      return {
        months: [],
        principal: [],
        interest: [],
        balance: [],
        cumulativePrincipal: [],
        cumulativeInterest: []
      };
    }

    // Process monthly data
    const months = schedule.map(payment => `Month ${payment.month}`);
    const principal = schedule.map(payment => payment.principalPayment);
    const interest = schedule.map(payment => payment.interestPayment);
    const balance = schedule.map(payment => payment.balance);

    // Calculate cumulative values
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    const cumulativePrincipalData = [];
    const cumulativeInterestData = [];

    schedule.forEach(payment => {
      cumulativePrincipal += payment.principalPayment;
      cumulativeInterest += payment.interestPayment;

      cumulativePrincipalData.push(cumulativePrincipal);
      cumulativeInterestData.push(cumulativeInterest);
    });

    return {
      months,
      principal,
      interest,
      balance,
      cumulativePrincipal: cumulativePrincipalData,
      cumulativeInterest: cumulativeInterestData
    };
  };

  const { months, principal, interest, balance, cumulativePrincipal, cumulativeInterest } = processData();

  // Enhanced chart options with better styling and readability
  const options = {
    chart: {
      type: 'area',
      height: 500,
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        export: {
          svg: {
            filename: 'amortization-chart-svg',
          },
          png: {
            filename: 'amortization-chart-png',
          },
          csv: {
            filename: 'amortization-data-csv',
            columnDelimiter: ',',
          },
        },
      },
      zoom: {
        enabled: true,
        type: 'xy',
        autoScaleYaxis: true,
        zoomedArea: {
          fill: {
            color: '#90CAF9',
            opacity: 0.4
          },
          stroke: {
            color: '#0D47A1',
            opacity: 0.4,
            width: 1
          }
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 450
        }
      },
      events: {
        mounted: (chart) => {
          // Add a slight delay before animation starts for a more dramatic effect
          setTimeout(() => {
            chart.windowResizeHandler();
          }, 300);
        },
        updated: (chart) => {
          chart.windowResizeHandler();
        },
        zoomed: (chartContext, { xaxis, yaxis }) => {
          // Custom zoom effect
        },
      },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
      dropShadow: {
        enabled: true,
        top: 5,
        left: 0,
        blur: 8,
        opacity: 0.2
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '65%',
        dataLabels: {
          position: 'top',
        }
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth',
      colors: ['transparent', 'transparent', '#10b981']
    },
    grid: {
      borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
      row: {
        colors: document.documentElement.classList.contains('dark') ? ['#1f2937', '#111827'] : ['#f9fafb', '#ffffff']
      },
      column: {
        colors: document.documentElement.classList.contains('dark') ? ['#1f2937', '#111827'] : ['#f9fafb', '#ffffff']
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      categories: months,
      tickAmount: Math.min(12, months.length),
      labels: {
        style: {
          colors: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
          fontWeight: 500
        }
      },
      axisBorder: {
        show: true,
        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
      },
      axisTicks: {
        show: true,
        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
      }
    },
    yaxis: [
      {
        title: {
          text: `Payment Amount (${currentLocale.currency})`,
          style: {
            color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
            fontWeight: 600,
            fontSize: '12px'
          }
        },
        labels: {
          formatter: function (value) {
            return currentLocale.currency + value.toLocaleString();
          },
          style: {
            colors: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280'
          }
        },
        axisBorder: {
          show: true,
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      },
      {
        opposite: true,
        title: {
          text: `Remaining Balance (${currentLocale.currency})`,
          style: {
            color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
            fontWeight: 600,
            fontSize: '12px'
          }
        },
        labels: {
          formatter: function (value) {
            return currentLocale.currency + value.toLocaleString();
          },
          style: {
            colors: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280'
          }
        },
        axisBorder: {
          show: true,
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      }
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      offsetY: 0,
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: -3
      },
      labels: {
        colors: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280'
      },
      itemMargin: {
        horizontal: 10
      }
    },
    fill: {
      opacity: 1,
      type: ['solid', 'solid', 'gradient'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        opacityFrom: 0.9,
        opacityTo: 0.5,
        stops: [0, 100]
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const month = months[dataPointIndex];
        const principalValue = cumulativePrincipal[dataPointIndex];
        const interestValue = cumulativeInterest[dataPointIndex];
        const balanceValue = balance[dataPointIndex];
        const monthlyPrincipal = principal[dataPointIndex];
        const monthlyInterest = interest[dataPointIndex];
        const monthlyPayment = monthlyPrincipal + monthlyInterest;

        // Calculate percentages
        const totalPayment = principalValue + interestValue;
        const principalPercent = ((principalValue / totalPayment) * 100).toFixed(1);
        const interestPercent = ((interestValue / totalPayment) * 100).toFixed(1);

        // Format currency
        const formatCurrency = (value) => currentLocale.currency + value.toLocaleString();

        // Determine theme colors
        const isDark = document.documentElement.classList.contains('dark');
        const bgColor = isDark ? '#1f2937' : '#ffffff';
        const borderColor = isDark ? '#374151' : '#e5e7eb';
        const textColor = isDark ? '#f3f4f6' : '#1f2937';
        const subTextColor = isDark ? '#d1d5db' : '#6b7280';

        return (
          '<div class="apexcharts-tooltip-custom" style="' +
          'background: ' + bgColor + '; ' +
          'border: 1px solid ' + borderColor + '; ' +
          'border-radius: 8px; ' +
          'padding: 12px; ' +
          'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); ' +
          'min-width: 220px;">' +

          '<div style="font-weight: 600; font-size: 14px; color: ' + textColor + '; margin-bottom: 8px; border-bottom: 1px solid ' + borderColor + '; padding-bottom: 6px;">' +
          month +
          '</div>' +

          '<div style="margin-bottom: 10px;">' +
          '<div style="font-weight: 600; font-size: 13px; color: ' + textColor + '; margin-bottom: 4px; border-bottom: 1px dashed ' + borderColor + '; padding-bottom: 2px;">Monthly Payment</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Principal:</span>' +
          '<span style="color: #3b82f6; font-weight: 600; font-size: 13px;">' + formatCurrency(monthlyPrincipal) + '</span>' +
          '</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Interest:</span>' +
          '<span style="color: #6366f1; font-weight: 600; font-size: 13px;">' + formatCurrency(monthlyInterest) + '</span>' +
          '</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Total:</span>' +
          '<span style="color: ' + textColor + '; font-weight: 600; font-size: 13px;">' + formatCurrency(monthlyPayment) + '</span>' +
          '</div>' +
          '</div>' +

          '<div style="margin-bottom: 10px;">' +
          '<div style="font-weight: 600; font-size: 13px; color: ' + textColor + '; margin-bottom: 4px; border-bottom: 1px dashed ' + borderColor + '; padding-bottom: 2px;">Cumulative Totals</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Principal Paid:</span>' +
          '<span style="color: #3b82f6; font-weight: 600; font-size: 13px;">' + formatCurrency(principalValue) + ' (' + principalPercent + '%)</span>' +
          '</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Interest Paid:</span>' +
          '<span style="color: #6366f1; font-weight: 600; font-size: 13px;">' + formatCurrency(interestValue) + ' (' + interestPercent + '%)</span>' +
          '</div>' +

          '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Total Paid:</span>' +
          '<span style="color: ' + textColor + '; font-weight: 600; font-size: 13px;">' + formatCurrency(totalPayment) + '</span>' +
          '</div>' +
          '</div>' +

          '<div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid ' + borderColor + '; padding-top: 6px;">' +
          '<span style="color: ' + subTextColor + '; font-size: 12px;">Remaining Balance:</span>' +
          '<span style="color: #10b981; font-weight: 600; font-size: 13px;">' + formatCurrency(balanceValue) + '</span>' +
          '</div>' +

          '</div>'
        );
      },
      onDatasetHover: {
        highlightDataSeries: true,
      },
      style: {
        fontSize: '13px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
      marker: {
        show: true,
        fillColors: ['#3b82f6', '#6366f1', '#10b981']
      },
      y: {
        formatter: function (value) {
          return currentLocale.currency + value.toLocaleString();
        }
      }
    },
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      palette: 'palette1',
      monochrome: {
        enabled: false,
        color: '#3b82f6',
        shadeTo: 'light',
        shadeIntensity: 0.65
      }
    }
  };

  // Enhanced chart series with better styling and animations
  const series = [
    {
      name: 'Cumulative Principal',
      data: cumulativePrincipal,
      type: 'area',
      color: '#3b82f6',
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        stops: [
          [0, 'rgba(59, 130, 246, 0.7)'],
          [1, 'rgba(59, 130, 246, 0.1)']
        ]
      },
      // Add hover effect
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.12
          }
        },
        active: {
          filter: {
            type: 'darken',
            value: 0.12
          }
        }
      },
    },
    {
      name: 'Cumulative Interest',
      data: cumulativeInterest,
      type: 'area',
      color: '#6366f1',
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        stops: [
          [0, 'rgba(99, 102, 241, 0.7)'],
          [1, 'rgba(99, 102, 241, 0.1)']
        ]
      },
      // Add hover effect
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.12
          }
        },
        active: {
          filter: {
            type: 'darken',
            value: 0.12
          }
        }
      },
    },
    {
      name: 'Remaining Balance',
      type: 'line',
      data: balance,
      color: '#10b981',
      yAxisIndex: 1,
      lineWidth: 3,
      curve: 'smooth',
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#34d399'],
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100]
        }
      },
      markers: {
        size: 6,
        colors: ['#10b981'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: {
          size: 9,
          sizeOffset: 3
        }
      },
      // Enhanced animation
      animation: {
        enabled: true,
        easing: 'easeinout',
        speed: 1200,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      },
      // Add hover effect
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.05
          }
        },
        active: {
          filter: {
            type: 'darken',
            value: 0.15
          }
        }
      },
      // Add drop shadow for line
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 4,
        opacity: 0.2,
        color: '#10b981'
      }
    }
  ];

  return (
    <div className="apex-chart-container">
      {months.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={500}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Preparing chart data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApexAmortizationChart;
