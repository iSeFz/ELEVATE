import { Timestamp } from "firebase-admin/firestore";
import { Address, TimestampUnion } from "../../types/models/common.js";
import { getAddressCoordinatesAPI } from "../utility.js";

export const convertToTimestamp = (date: TimestampUnion | undefined): Timestamp => {
    try {
        if (typeof date === 'string') {
            return Timestamp.fromDate(new Date(date));
        } else if (typeof date === 'number') {
            return Timestamp.fromMillis(date);
        } else if (date instanceof Timestamp) {
            return date;
        } else {
            return Timestamp.now(); // Default to current time if invalid
        }
    } catch (error) {
        console.error('Error in convertToTimestamp:', error);
        return Timestamp.now(); // Fallback to current time
    }
}

export const fillDataAddressesCoordinates = async (addresses: Address[] | undefined | null): Promise<void> => {
    if(addresses === undefined || addresses === null || addresses.length === 0) {
        return; // No addresses to process
    }
    for (const address of addresses) {
        if (!address.latitude || !address.longitude) {
            const location = await getAddressCoordinatesAPI(
                address.building.toString(),
                address.street,
                address.city,
                address.postalCode.toString(),
            );
            if (location) {
                address.latitude = location.latitude;
                address.longitude = location.longitude;
            } else {
                address.latitude = 0.0;
                address.longitude = 0.0;
            }
        }
    }
}
