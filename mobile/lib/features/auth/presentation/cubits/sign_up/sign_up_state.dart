// Sign Up Cubit Related States
enum SignUpMethod { form, google }

abstract class SignUpState {
  bool get isPasswordVisible => false;
  bool get isConfirmPasswordVisible => false;
}

class SignUpInitial extends SignUpState {
  @override
  final bool isPasswordVisible;
  @override
  final bool isConfirmPasswordVisible;
  SignUpInitial({
    this.isPasswordVisible = false,
    this.isConfirmPasswordVisible = false,
  });
}

class SignUpLoading extends SignUpState {
  final SignUpMethod signUpMethod;
  @override
  final bool isPasswordVisible;
  @override
  final bool isConfirmPasswordVisible;
  SignUpLoading({
    required this.isPasswordVisible,
    required this.isConfirmPasswordVisible,
    required this.signUpMethod,
  });
}

// Indicates successful registration via form
class SignUpSuccess extends SignUpState {}

// Indicates successful sign-up/linking via Google
class SignUpWithGoogleSuccess extends SignUpState {}

class SignUpFailure extends SignUpState {
  final String message;
  @override
  final bool isPasswordVisible;
  @override
  final bool isConfirmPasswordVisible;
  SignUpFailure({
    required this.message,
    required this.isPasswordVisible,
    required this.isConfirmPasswordVisible,
  });
}

// Specific state for password visibility changes
class SignUpPasswordVisibilityChanged extends SignUpState {
  @override
  final bool isPasswordVisible;
  @override
  final bool isConfirmPasswordVisible;
  SignUpPasswordVisibilityChanged({
    required this.isPasswordVisible,
    required this.isConfirmPasswordVisible,
  });
}
