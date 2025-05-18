// Accessibility helpers for screen readers and keyboard navigation
export const announceToScreenReader = (message, priority = 'polite') => {
  // Create or get the announcement container
  let container = document.getElementById('screen-reader-announcer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'screen-reader-announcer';
    container.setAttribute('aria-live', priority);
    container.setAttribute('aria-atomic', 'true');
    container.setAttribute('role', 'status');
    container.style.position = 'absolute';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.padding = '0';
    container.style.overflow = 'hidden';
    container.style.clip = 'rect(0, 0, 0, 0)';
    container.style.whiteSpace = 'nowrap';
    container.style.border = '0';
    document.body.appendChild(container);
  }

  // Set the priority
  container.setAttribute('aria-live', priority);

  // Clear the container first (this helps screen readers announce the new content)
  container.textContent = '';

  // Set the new message after a small delay
  setTimeout(() => {
    container.textContent = message;
  }, 50);
};

// Create screen reader friendly descriptions for charts
export const generateChartDescription = (chartData, chartType, title) => {
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return `${title || 'Chart'} with no data.`;
  }

  const { labels, datasets } = chartData;
  let description = `${title || chartType + ' chart'} showing `;

  if (chartType === 'pie' || chartType === 'doughnut') {
    description += `the following segments: `;
    labels.forEach((label, index) => {
      const value = datasets[0].data[index];
      description += `${label}: ${value}${index < labels.length - 1 ? ', ' : '.'}`;
    });
  } else if (chartType === 'bar' || chartType === 'line') {
    const datasetNames = datasets.map(d => d.label).join(' and ');
    description += `${datasetNames} for ${labels.length} categories: `;

    labels.forEach((label, index) => {
      description += `${label}${index < labels.length - 1 ? ', ' : '.'}`;
    });

    // Add min/max values
    if (datasets.length > 0) {
      const allValues = datasets.flatMap(d => d.data);
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      description += ` Values range from ${min} to ${max}.`;
    }
  }

  return description;
};

// Trap keyboard focus inside modal dialogs
export const createFocusTrap = (container) => {
  if (!container) return { activate: () => {}, deactivate: () => {} };

  // Get all focusable elements
  const getFocusableElements = () => {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
  };

  let focusableElements = [];
  let previousActiveElement = null;

  // Handle keydown events
  const handleKeyDown = (e) => {
    // Update the list of focusable elements in case DOM has changed
    focusableElements = getFocusableElements();

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Handle Tab key
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // If shift+tab and on first element, move to last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab and on last element, move to first element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Handle Escape key
    if (e.key === 'Escape') {
      // Trigger a click on a close button if it exists
      const closeButton = container.querySelector('[data-close-modal]');
      if (closeButton) {
        closeButton.click();
      }
    }
  };

  return {
    activate: () => {
      // Store the currently focused element
      previousActiveElement = document.activeElement;

      // Get all focusable elements
      focusableElements = getFocusableElements();

      // Focus the first element
      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 10);
      }

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
    },
    deactivate: () => {
      // Remove event listener
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously active element
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }
  };
};

// Add "Skip to content" link for keyboard users
export const addSkipLink = (targetId = 'main-content') => {
  // Check if skip link already exists
  if (document.getElementById('skip-link')) return;

  // Create skip link
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-link';
  skipLink.href = `#${targetId}`;
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';

  // Add styles
  skipLink.style.position = 'absolute';
  skipLink.style.top = '-40px';
  skipLink.style.left = '0';
  skipLink.style.padding = '8px 16px';
  skipLink.style.background = '#0066cc';
  skipLink.style.color = 'white';
  skipLink.style.zIndex = '1000';
  skipLink.style.transition = 'top 0.3s';

  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  // Hide on blur
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  // Add to document
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Ensure target element has tabindex
  const targetElement = document.getElementById(targetId);
  if (targetElement && !targetElement.hasAttribute('tabindex')) {
    targetElement.setAttribute('tabindex', '-1');
  }
};
