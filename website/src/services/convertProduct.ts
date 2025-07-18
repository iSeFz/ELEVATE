export function capitalizeProductName(name: string): string {
    if(!name || typeof name !== 'string') {
        return name;
    }   
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}