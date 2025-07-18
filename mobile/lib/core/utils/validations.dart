// This file contains the validation logic for the form fields

// Validation logic for the email field
String? validateEmail(String? value) {
  final RegExp emailRegex = RegExp(
    r'^[\w-]+(\.[\w-]+)*@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2,}$',
  );
  if (value == null || value.isEmpty) {
    return 'Email is required';
  } else if (!emailRegex.hasMatch(value)) {
    return 'Invalid email format';
  } else {
    return null;
  }
}

// Validation logic for the name field
String? validateName(String? value) {
  final RegExp nameRegex = RegExp(r'^[a-zA-Z\s]+$');
  if (value == null || value.isEmpty) {
    return 'Name is required';
  } else if (!nameRegex.hasMatch(value)) {
    return 'Name must contain only letters and spaces';
  } else {
    return null;
  }
}

// Validation logic for the username field
String? validateUsername(String? value) {
  final RegExp usernameRegex = RegExp(r'^\w+$');
  if (value == null || value.isEmpty) {
    return 'Username is required';
  } else if (value.length < 6) {
    return 'Username must be at least 6 characters long';
  } else if (!usernameRegex.hasMatch(value)) {
    return 'Username must contain only letters and numbers';
  } else {
    return null;
  }
}

// Validation logic for the phone number field
String? validatePhoneNumber(String? value) {
  final RegExp phoneRegex = RegExp(r'^(010|011|012|015)[0-9]{8}$');
  if (value == null || value.isEmpty) {
    return 'Phone number is required';
  } else if (!phoneRegex.hasMatch(value)) {
    return 'Phone number must be 11 digits long';
  } else {
    return null;
  }
}

// Validation logic for the password field
String? validatePassword(String? value) {
  final RegExp passwordRegex = RegExp(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":_{}|<>]).{8,}$',
  );
  if (value == null || value.isEmpty) {
    return 'Password is required';
  } else if (!passwordRegex.hasMatch(value)) {
    return 'Password must be:\n1. At least 8 characters long.\n2. Contain at least one (capital letter, number, and symbol).';
  } else {
    return null;
  }
}

// Validation logic for the password field for login
String? validatePasswordLogin(String? value) {
  if (value == null || value.isEmpty) {
    return 'Password is required';
  } else {
    return null;
  }
}

// Validation logic for email or phone number field at login page
String? validateEmailNPhoneNumber(String? value) {
  if (validateEmail(value) == null || validatePhoneNumber(value) == null) {
    return null;
  }
  return 'Enter a valid email or phone number';
}
