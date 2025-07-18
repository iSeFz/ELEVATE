import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/customer.dart';
import '../../../data/services/auth_service.dart';
import 'sign_up_state.dart';
import '../../../../../core/services/algolia_insights_service.dart';


// Sign Up Cubit
class SignUpCubit extends Cubit<SignUpState> {
  final AuthService _authService = AuthService();
  Customer? _customer;
  Customer? get customer => _customer;

  // Hold current visibility state within the Cubit
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  // Fields for form and controllers
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  SignUpCubit()
    : super(
        SignUpInitial(
          isPasswordVisible: false,
          isConfirmPasswordVisible: false,
        ),
      );

  // Dispose controllers
  void disposeControllers() {
    emailController.dispose();
    usernameController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
    phoneNumberController.dispose();
    passwordController.dispose();
  }

  // Submit form
  Future<void> submitForm() async {
    if (formKey.currentState!.validate()) {
      formKey.currentState!.save();

      final customerToSignUp = Customer(
        email: emailController.text,
        username: usernameController.text,
        firstName: firstNameController.text,
        lastName: lastNameController.text,
        phoneNumber: phoneNumberController.text,
        password: passwordController.text,
      );
      await registerUser(customerToSignUp);
    }
  }

  void togglePasswordVisibility() {
    _isPasswordVisible = !_isPasswordVisible;
    emit(
      SignUpPasswordVisibilityChanged(
        isPasswordVisible: _isPasswordVisible,
        isConfirmPasswordVisible: _isConfirmPasswordVisible,
      ),
    );
  }

  void toggleConfirmPasswordVisibility() {
    _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
    emit(
      SignUpPasswordVisibilityChanged(
        isPasswordVisible: _isPasswordVisible,
        isConfirmPasswordVisible: _isConfirmPasswordVisible,
      ),
    );
  }

  Future<void> registerUser(Customer customerData) async {
    // Pass current visibility to loading and failure states
    emit(
      SignUpLoading(
        isPasswordVisible: _isPasswordVisible,
        isConfirmPasswordVisible: _isConfirmPasswordVisible,
        signUpMethod: SignUpMethod.form,
      ),
    );
    try {
      _customer = await _authService.registerUser(customerData);
      if (_customer != null) {
        // Initialize Algolia Insights with the user's ID
        if (_customer!.id != null) {
          AlgoliaInsightsService.initializeInsights(_customer!.id!);
        }
        emit(SignUpSuccess());
      } else {
        // This case should ideally be handled by an exception in AuthService
        emit(
          SignUpFailure(
            message: 'Signup failed: No user data returned',
            isPasswordVisible: _isPasswordVisible,
            isConfirmPasswordVisible: _isConfirmPasswordVisible,
          ),
        );
      }
    } catch (e) {
      emit(
        SignUpFailure(
          message: 'Failed to sign up: ${e.toString()}',
          isPasswordVisible: _isPasswordVisible,
          isConfirmPasswordVisible: _isConfirmPasswordVisible,
        ),
      );
    }
  }

  Future<void> signUpWithGoogle() async {
    emit(
      SignUpLoading(
        isPasswordVisible: _isPasswordVisible,
        isConfirmPasswordVisible: _isConfirmPasswordVisible,
        signUpMethod: SignUpMethod.google,
      ),
    );
    try {
      _customer = await _authService.signUpWithGoogle();
      if (_customer != null) {
        // Initialize Algolia Insights with the user's ID 
        if (_customer!.id != null) {
          AlgoliaInsightsService.initializeInsights(_customer!.id!);
        }
        emit(SignUpWithGoogleSuccess());
      } else {
        // This case should ideally be handled by an exception in AuthService
        emit(
          SignUpFailure(
            message: 'Google Sign-Up failed: No user data returned.',
            isPasswordVisible: _isPasswordVisible,
            isConfirmPasswordVisible: _isConfirmPasswordVisible,
          ),
        );
      }
    } catch (e) {
      emit(
        SignUpFailure(
          message: 'Google Sign-Up failed: ${e.toString()}',
          isPasswordVisible: _isPasswordVisible,
          isConfirmPasswordVisible: _isConfirmPasswordVisible,
        ),
      );
    }
  }
}
