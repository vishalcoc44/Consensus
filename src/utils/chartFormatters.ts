
/**
 * Utility functions for formatting and transforming chart data
 */

/**
 * Format a number as currency, percentage or plain number with custom options
 */
export function formatValue(
  value: number, 
  options: {
    format?: 'number' | 'currency' | 'percent' | 'compact';
    locale?: string;
    currency?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const {
    format = 'number',
    locale = 'en-US',
    currency = 'USD',
    decimals = 0,
    prefix = '',
    suffix = ''
  } = options;

  let formattedValue = '';

  switch (format) {
    case 'currency':
      formattedValue = new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency, 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      }).format(value);
      break;
    case 'percent':
      formattedValue = new Intl.NumberFormat(locale, { 
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      }).format(value / 100);
      break;
    case 'compact':
      formattedValue = new Intl.NumberFormat(locale, { 
        notation: 'compact',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      }).format(value);
      break;
    default:
      formattedValue = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
  }

  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Transform data for radar/spider charts
 */
export function transformForRadarChart<T extends Record<string, any>>(
  data: T[],
  categories: string[],
  valueAccessor: (item: T, category: string) => number
): Array<Record<string, any>> {
  return categories.map(category => {
    const result: Record<string, any> = { category };
    
    data.forEach((item, index) => {
      // Use a property name like 'item0', 'item1', etc. to store the value
      result[`item${index}`] = valueAccessor(item, category);
      
      // If the item has a name property, use it as the property name
      if ('name' in item && typeof item.name === 'string') {
        result[item.name] = valueAccessor(item, category);
      }
    });
    
    return result;
  });
}

/**
 * Transform hierarchical data for treemap, sunburst, etc.
 */
export function transformHierarchicalData<T extends Record<string, any>>(
  data: T[],
  idKey: string = 'id',
  valueKey: string = 'value',
  childrenKey: string = 'children',
  parentKey: string = 'parent'
): Record<string, any> {
  const root = {
    name: 'root',
    children: [] as Record<string, any>[]
  };

  // First, create a map of items by ID
  const itemsMap = new Map();
  data.forEach(item => {
    itemsMap.set(item[idKey], {
      name: item.name || item[idKey],
      value: item[valueKey] || 0,
      children: []
    });
  });
  
  // Then, build the hierarchy
  data.forEach(item => {
    const currentItem = itemsMap.get(item[idKey]);
    
    if (item[parentKey]) {
      // This is a child item
      const parentItem = itemsMap.get(item[parentKey]);
      if (parentItem) {
        parentItem.children.push(currentItem);
      }
    } else {
      // This is a root level item
      root.children.push(currentItem);
    }
  });
  
  return root;
}
