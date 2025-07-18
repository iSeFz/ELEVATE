import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/customer.dart';
import '../../../data/services/auth_service.dart';
import 'login_state.dart';
import '../../../../../core/services/algolia_insights_service.dart';

// Login Cubit
class LoginCubit extends Cubit<LoginState> {
  final AuthService _authService = AuthService();
  Customer? _customer;
  Customer? get customer => _customer;

  // Hold current visibility state within the Cubit
  bool _isPasswordVisible = false;

  // Fields for form and controllers
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // Fields for forgot password
  final GlobalKey<FormState> forgotPasswordFormKey = GlobalKey<FormState>();
  final TextEditingController forgotPasswordEmailController =
      TextEditingController();

  LoginCubit() : super(LoginInitial(isPasswordVisible: false));

  // Dispose controllers
  void disposeControllers() {
    emailController.dispose();
    passwordController.dispose();
  }

  // Submit form
  Future<void> submitForm() async {
    if (formKey.currentState!.validate()) {
      formKey.currentState!.save();
      await loginUser(emailController.text, passwordController.text);
    }
  }

  void togglePasswordVisibility() {
    _isPasswordVisible = !_isPasswordVisible;
    emit(LoginPasswordVisibilityChanged(isPasswordVisible: _isPasswordVisible));
  }

  Future<void> loginUser(String email, String password) async {
    emit(
      LoginLoading(
        isPasswordVisible: _isPasswordVisible,
        loginMethod: LoginMethod.form,
      ),
    );
    try {
      _customer = await _authService.loginUser(email, password);
      if (_customer != null) {
        // Initialize Algolia Insights with the user's ID
        if (_customer!.id != null) {
          AlgoliaInsightsService.initializeInsights(_customer!.id!);
        }
        emit(LoginSuccess());
      } else {
        emit(
          LoginFailure(
            message: 'Login failed: No user data returned',
            isPasswordVisible: _isPasswordVisible,
          ),
        );
      }
    } catch (e) {
      emit(
        LoginFailure(
          message: 'Failed to login: ${e.toString()}',
          isPasswordVisible: _isPasswordVisible,
        ),
      );
    }
  }

  Future<void> signInWithGoogle() async {
    emit(
      LoginLoading(
        isPasswordVisible: _isPasswordVisible,
        loginMethod: LoginMethod.google,
      ),
    );
    try {
      _customer = await _authService.signInWithGoogleLogin();
      if (_customer != null) {
        // Initialize Algolia Insights with the user's ID
        if (_customer!.id != null) {
          AlgoliaInsightsService.initializeInsights(_customer!.id!);
        }
        emit(LoginWithGoogleSuccess());
      } else {
        emit(
          LoginFailure(
            message: 'No account found :( Creating one for you...',
            isPasswordVisible: _isPasswordVisible,
          ),
        );
        _customer = await _authService.signUpWithGoogle();
        if (_customer != null) {
          // Initialize Algolia Insights with the user's ID
          if (_customer!.id != null) {
            AlgoliaInsightsService.initializeInsights(_customer!.id!);
          }
          emit(LoginWithGoogleSuccess());
        }
      }
    } catch (e) {
      emit(
        LoginFailure(
          message: 'Google Sign-In failed: ${e.toString()}',
          isPasswordVisible: _isPasswordVisible,
        ),
      );
    }
  }

  // --- Forgot Password Related Methods ---

  // Forgot password and send a reset email
  Future<void> forgotPassword(String validEmail) async {
    emit(ForgotPasswordLoading());
    try {
      // Call the service to reset the password
      if (await _authService.forgotPassword(validEmail)) {
        emit(PasswordResetSuccess());
      } else {
        emit(ForgotPasswordError(message: "Failed to reset password."));
      }
    } catch (e) {
      emit(ForgotPasswordError(message: e.toString()));
    }
  }

  // Submit the forgot password form
  void submitForgotPassword() {
    if (forgotPasswordFormKey.currentState!.validate()) {
      forgotPasswordFormKey.currentState!.save();
      forgotPassword(forgotPasswordEmailController.text);
    }
  }
}
