export const shipmentType = {
    "express": "express",
    "standard": "standard",
    "pickup": "pickup"
}

export const paymentMethod = {
    "cash-on-delivery": "cash on delivery",
    "card": "card payment"
}

export const ORDER_TIMEOUT_SEC = 10 * 60; // 10 minutes

export const shipmentTypeValues = Object.values(shipmentType);

export const paymentMethodValues = Object.values(paymentMethod);
