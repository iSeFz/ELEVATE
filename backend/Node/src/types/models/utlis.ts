export const checkValidEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const checkValidPhoneNumberFormat = (phoneNumber: string): boolean => {
    // Example: Phone number must start with 010, 011, 012, or 015 and be followed by 8 digits
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phoneNumber);
}

export const checkValidPasswordFormat = (password: string): boolean => {
    // Example: Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%?&)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    return passwordRegex.test(password);
}

export const checkValidUsernameFormat = (username: string): boolean => {
    // Example: Username must be at least 3 characters long and can contain letters, numbers, and underscores
    const usernameRegex = /^\w{3,}$/;
    return usernameRegex.test(username);
}

export const checkValidURLFormat = (imageURL: string): boolean => {
    // Example: URL must start with http:// or https:// and end with .jpg, .jpeg, .png, or .gif
    const urlRegex = /^(http|https):\/\/[^\s]+$/;
    return urlRegex.test(imageURL);
}
