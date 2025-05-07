import { Timestamp } from "firebase-admin/firestore";
import { TimestampUnion } from "../../types/models/common.js";

export const convertToTimestamp = (date: TimestampUnion): Timestamp => {
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
