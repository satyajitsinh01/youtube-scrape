// Helper function to format column header
export const formatColumnHeader = (key: string): string => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper function to format cell value based on type
export const formatCellValue = (value: any): string => {
    // Handle undefined, null or empty string
    if (value === undefined || value === null || value === '') {
        return 'N/A';
    }
    
    // Handle different types
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    
    // Handle string that represents a boolean
    if (value === 'true' || value === 'false') {
        return value === 'true' ? 'Yes' : 'No';
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'N/A';
    }
    
    // Handle YouTube duration format
    if (typeof value === 'string' && value.startsWith('PT')) {
        return value
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm ')
            .replace('S', 's');
    }
    
    // Handle date format
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        return new Date(value).toLocaleString();
    }
    
    // Handle URLs in topic categories
    if (typeof value === 'string' && value.startsWith('https://')) {
        return value.split('/').pop() || value;
    }
    
    // For all other strings
    return String(value);
};