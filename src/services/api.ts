import axios from 'axios';


const API_BASE_URL = 'http://localhost:8002';

export const searchVideos = async (query: string, filters?: any): Promise<any> => {
    try {
        const response = await axios.get<any>(`${API_BASE_URL}/search`, {
            params: {
                query,
                ...filters
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching videos:', error);
        throw error;
    }
}; 