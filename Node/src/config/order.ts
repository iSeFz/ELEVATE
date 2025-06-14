export const shipmentType = {
    "express": "Express",
    "standard": "Standard",
    "pickup": "Pickup"
}

export const paymentMethod = {
    "cash-on-delivery": "Cash on delivery",
    "card": "Card payment"
}

export const ORDER_TIMEOUT_SEC = 10 * 60; // 10 minutes

export const shipmentTypeValues = Object.values(shipmentType);

export const paymentMethodValues = Object.values(paymentMethod);
