import { FaHome, FaBuilding, FaWarehouse, FaTree } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import TooltipOverlay from '../ui/modern/TooltipOverlay';

/**
 * PropertyTypeSelector component for selecting property types
 * with appropriate icons and tooltips.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.propertyTypes - Available property types
 * @param {string} props.selectedType - Currently selected property type
 * @param {Function} props.onSelect - Function to call when a property type is selected
 * @returns {JSX.Element} Property type selector component
 */
const PropertyTypeSelector = ({ propertyTypes, selectedType, onSelect }) => {
  const { t } = useTranslation();

  if (!propertyTypes || propertyTypes.length === 0) {
    return null;
  }

  // Get icon based on property type ID
  const getIcon = (typeId) => {
    switch (typeId) {
      case 'residential':
        return <FaHome className="h-4 w-4" />;
      case 'commercial':
        return <FaBuilding className="h-4 w-4" />;
      case 'mixedUse':
        return <FaWarehouse className="h-4 w-4" />;
      case 'agricultural':
        return <FaTree className="h-4 w-4" />;
      default:
        return <FaHome className="h-4 w-4" />;
    }
  };

  // Get tooltip content based on property type ID
  const getTooltip = (typeId) => {
    switch (typeId) {
      case 'residential':
        return t('propertyTypes.residential.tooltip', 'Property used primarily as a residence');
      case 'commercial':
        return t('propertyTypes.commercial.tooltip', 'Property used for business purposes');
      case 'mixedUse':
        return t('propertyTypes.mixedUse.tooltip', 'Property with both residential and commercial use');
      case 'agricultural':
        return t('propertyTypes.agricultural.tooltip', 'Farmland and agricultural property');
      default:
        return '';
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Property Type
      </label>
      <div className="flex flex-wrap gap-2">
        {propertyTypes.map((type) => (
          <TooltipOverlay key={type.id} content={getTooltip(type.id)}>
            <button
              type="button"
              onClick={() => onSelect(type.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-pressed={selectedType === type.id}
            >
              <span className="mr-2">{getIcon(type.id)}</span>
              {type.name}
            </button>
          </TooltipOverlay>
        ))}
      </div>
    </div>
  );
};

export default PropertyTypeSelector;
