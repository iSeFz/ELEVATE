import axios from 'axios';
import { generateGeocodingURL } from '../config/googleServices.js';

export const getAddressCoordinatesAPI = async (building: string, street: string, city: string, postalCode: string) => {
    const url = generateGeocodingURL(building, street, city, postalCode);
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.status !== 'OK') {
            throw new Error(`Geocoding failed: ${data.status} - ${data.error_message ?? 'No error message provided'}`);
        }
        const location = data.results[0].geometry.location;
        return ({
            latitude: location.lat,
            longitude: location.lng,
            formattedAddress: data.results[0].formatted_address
        });
    } catch (error) {
        console.error('Error fetching address location:', error);
        return null; // or handle the error as needed
    }
}