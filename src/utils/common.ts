export const extractDataFromResponse = (items: any[]): any[] => {
    return items.map((item, index) => {
        // Extract video ID for thumbnail
        // const videoId = item.link ? item.link.split('v=')[1]?.split('&')[0] : '';
        
        // Create a copy of the item to avoid modifying the original
        const result: any = { id: index };
        
        // Process all top-level properties
        Object.keys(item).forEach(key => {
            if (key !== 'channel_info') {
                // Handle boolean strings
                if (item[key] === 'true') {
                    result[key] = true;
                } else if (item[key] === 'false') {
                    result[key] = false;
                } else {
                    result[key] = item[key];
                }
            }
        });
        
        // Add thumbnail
        // result.thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : 'N/A';
        
        // Process channel_info separately
        if (item.channel_info && typeof item.channel_info === 'object') {
            Object.keys(item.channel_info).forEach(channelKey => {
                const value = item.channel_info[channelKey];
                // Handle boolean strings in channel_info
                if (value === 'true') {
                    result[`channel_${channelKey}`] = true;
                } else if (value === 'false') {
                    result[`channel_${channelKey}`] = false;
                } else {
                    result[`channel_${channelKey}`] = value;
                }
            });
        }
        
        return result;
    });
};