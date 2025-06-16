const API_KEY = "AIzaSyABqEEAIgUA2daNGHV8zpjpYZ9_RGeXsA8";

export const generateGeocodingURL = (
    building: string,
    street: string,
    city: string,
    postalCode: string
): string => {
    const addressString = `
    ${building},
    ${street} Street, 
    ${city}, 
    ${city} City, 
    ${city} Governorate, 
    ${postalCode}, 
    , Egypt country`;
    const encodedAddress = encodeURIComponent(addressString);
    return `https://maps.googleapis.com/maps/api/geocode/json?key=${API_KEY}&address=${encodedAddress}`;
}
