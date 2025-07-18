// Login Cubit Related States
enum LoginMethod { form, google }

abstract class LoginState {
  bool get isPasswordVisible => false;
}

class LoginInitial extends LoginState {
  @override
  final bool isPasswordVisible;
  LoginInitial({this.isPasswordVisible = false});
}

class LoginLoading extends LoginState {
  final LoginMethod loginMethod;
  @override
  final bool isPasswordVisible;
  LoginLoading({required this.isPasswordVisible, required this.loginMethod});
}

// Indicates successful registration via form
class LoginSuccess extends LoginState {}

// Indicates successful sign-in/linking via Google
class LoginWithGoogleSuccess extends LoginState {}

class LoginFailure extends LoginState {
  final String message;
  @override
  final bool isPasswordVisible;
  LoginFailure({required this.message, required this.isPasswordVisible});
}

// Specific state for password visibility changes
class LoginPasswordVisibilityChanged extends LoginState {
  @override
  final bool isPasswordVisible;
  LoginPasswordVisibilityChanged({required this.isPasswordVisible});
}

// --- Forgot Password Related States ---
class ForgotPasswordLoading extends LoginState{}

class PasswordResetSuccess extends LoginState{}

class ForgotPasswordError extends LoginState {
  final String message;
  ForgotPasswordError({required this.message});
}
