import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/login/login_cubit.dart';
import '../cubits/login/login_state.dart';
import '../../../../core/widgets/custom_text_form_field.dart';
import '../../../common/main_page.dart';
import '../../../../core/utils/validations.dart';
import 'sign_up_page.dart';
import 'forgot_password_page.dart';

// Login Page
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    // Initialize the LoginCubit
    return BlocProvider<LoginCubit>(
      create: (context) => LoginCubit(),
      child: Builder(
        builder: (context) {
          final loginCubit = context.read<LoginCubit>();
          return BlocListener<LoginCubit, LoginState>(
            listener: (context, state) {
              if (state is LoginSuccess || state is LoginWithGoogleSuccess) {
                showDialog(
                  context: context,
                  builder: (context) {
                    return AlertDialog(
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          SizedBox(height: screenHeight * 0.02),
                          CircleAvatar(
                            backgroundColor: theme.colorScheme.primary,
                            radius: screenWidth * 0.1,
                            child: Icon(
                              Icons.check_circle_outlined,
                              color: Colors.white,
                              size: screenWidth * 0.2,
                            ),
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          Text(
                            'Success',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          RichText(
                            textAlign: TextAlign.center,
                            text: TextSpan(
                              style: theme.textTheme.bodyMedium,
                              children: [
                                TextSpan(
                                  text: 'Welcome back, ',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    fontSize: 20,
                                  ),
                                ),
                                TextSpan(
                                  text:
                                      '${loginCubit.customer?.firstName ?? 'User'}!',
                                  style: TextStyle(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      actionsAlignment: MainAxisAlignment.center,
                      actions: [
                        TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            padding: EdgeInsets.symmetric(
                              vertical: screenHeight * 0.005,
                              horizontal: screenWidth * 0.1,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              PageRouteBuilder(
                                pageBuilder:
                                    (context, animation, secondaryAnimation) =>
                                        MainPage(customer: loginCubit.customer!),
                                transitionsBuilder: (
                                  context,
                                  animation,
                                  secondaryAnimation,
                                  child,
                                ) {
                                  return FadeTransition(
                                    opacity: animation,
                                    child: child,
                                  );
                                },
                                transitionDuration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          child: Text(
                            'OK',
                            style: TextStyle(
                              color: theme.colorScheme.onPrimary,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                );
              } else if (state is LoginFailure) {
                if (ScaffoldMessenger.of(context).mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(state.message)));
                }
              }
            },
            child: GestureDetector(
              onTap: () => FocusScope.of(context).unfocus(),
              child: Scaffold(
                body: Center(
                  child: Form(
                    key: loginCubit.formKey,
                    child: Padding(
                      padding: const EdgeInsets.all(30.0),
                      child: ListView(
                        shrinkWrap: true,
                        children: [
                          const Text(
                            'Login',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Color(0xFFA51930),
                              fontSize: 46,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Arial',
                            ),
                          ),
                          const SizedBox(height: 30),
                          CustomTextFormField(
                            controller: loginCubit.emailController,
                            keyboardType: TextInputType.text,
                            label: 'Email',
                            hint: 'Enter your email',
                            validationFunc: validateEmailNPhoneNumber,
                          ),
                          const SizedBox(height: 20),
                          BlocBuilder<LoginCubit, LoginState>(
                            builder: (context, state) {
                              return CustomTextFormField(
                                controller: loginCubit.passwordController,
                                isPassword: !(state.isPasswordVisible),
                                keyboardType: TextInputType.text,
                                label: 'Password',
                                hint: 'Enter your password',
                                validationFunc: validatePasswordLogin,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    !state.isPasswordVisible
                                        ? Icons.visibility_rounded
                                        : Icons.visibility_off_rounded,
                                  ),
                                  onPressed: () {
                                    loginCubit.togglePasswordVisibility();
                                  },
                                ),
                              );
                            },
                          ),
                          Align(
                            alignment: Alignment.bottomRight,
                            child: TextButton(
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.all(0),
                              ),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (_) => BlocProvider.value(
                                          value: loginCubit,
                                          child: const ForgotPasswordPage(),
                                        ),
                                  ),
                                );
                              },
                              child: Text(
                                'Forgot your password?',
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 15),
                          BlocBuilder<LoginCubit, LoginState>(
                            builder: (context, state) {
                              return ElevatedButton(
                                onPressed:
                                    state is LoginLoading && state.loginMethod == LoginMethod.form
                                        ? null
                                        : () => loginCubit.submitForm(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.black,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  elevation: 0,
                                ),
                                child:
                                    state is LoginLoading && state.loginMethod == LoginMethod.form
                                        ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                        : const Text(
                                          'Login',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                              );
                            },
                          ),
                          const SizedBox(height: 30),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  height: 1,
                                  color: const Color(0xFFE6E6E6),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'or',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
                                  fontFamily: 'Arial',
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Container(
                                  height: 1,
                                  color: const Color(0xFFE6E6E6),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 30),
                          BlocBuilder<LoginCubit, LoginState>(
                            builder: (context, state) {
                              return ElevatedButton(
                                onPressed:
                                    state is LoginLoading && state.loginMethod == LoginMethod.google
                                        ? null
                                        : () async {
                                          loginCubit.signInWithGoogle();
                                        },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey.shade300,
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  elevation: 0,
                                ),
                                child:
                                    state is LoginLoading && state.loginMethod == LoginMethod.google
                                        ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.black,
                                          ),
                                        )
                                        : Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Image.asset(
                                              'assets/google.png',
                                              width: 24,
                                              height: 24,
                                            ),
                                            const SizedBox(width: 10),
                                            const Text(
                                              'Continue with Google',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                              );
                            },
                          ),
                          const SizedBox(height: 30),
                          Text.rich(
                            textAlign: TextAlign.center,
                            TextSpan(
                              children: [
                                const TextSpan(
                                  text: 'Don\'t have an account? ',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontFamily: 'Arial',
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                TextSpan(
                                  text: 'Register Now',
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.primary,
                                    fontSize: 14,
                                    fontFamily: 'Arial',
                                    fontWeight: FontWeight.w500,
                                  ),
                                  recognizer:
                                      TapGestureRecognizer()
                                        ..onTap = () {
                                          Navigator.pushReplacement(
                                            context,
                                            PageRouteBuilder(
                                              pageBuilder:
                                                  (
                                                    context,
                                                    animation,
                                                    secondaryAnimation,
                                                  ) => SignUpPage(),
                                              transitionsBuilder: (
                                                context,
                                                animation,
                                                secondaryAnimation,
                                                child,
                                              ) {
                                                return FadeTransition(
                                                  opacity: animation,
                                                  child: child,
                                                );
                                              },
                                              transitionDuration:
                                                  const Duration(seconds: 1),
                                            ),
                                          );
                                        },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
