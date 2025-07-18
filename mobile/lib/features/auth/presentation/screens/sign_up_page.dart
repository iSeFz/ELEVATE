import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/sign_up/sign_up_cubit.dart';
import '../cubits/sign_up/sign_up_state.dart';
import '../../../../core/widgets/custom_text_form_field.dart';
import '../../../../core/utils/validations.dart';
import '../../../common/main_page.dart';
import 'login_page.dart';

// Sign Up Page
class SignUpPage extends StatelessWidget {
  const SignUpPage({super.key});

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    final theme = Theme.of(context);

    return BlocProvider<SignUpCubit>(
      create: (context) => SignUpCubit(),
      child: Builder(
        builder: (context) {
          final signUpCubit = context.read<SignUpCubit>();

          return BlocListener<SignUpCubit, SignUpState>(
            listener: (context, state) {
              if (state is SignUpSuccess || state is SignUpWithGoogleSuccess) {
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
                                  text: 'Account created!\nWelcome, ',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    fontSize: 20,
                                  ),
                                ),
                                TextSpan(
                                  text:
                                      '${signUpCubit.customer?.firstName ?? 'User'}!',
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
                                        MainPage(customer: signUpCubit.customer!),
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
              } else if (state is SignUpFailure) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(state.message)));
              }
            },
            child: GestureDetector(
              onTap: () => FocusScope.of(context).unfocus(),
              child: Scaffold(
                body: Center(
                  child: Form(
                    key: signUpCubit.formKey,
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.08,
                        vertical: screenHeight * 0.02,
                      ),
                      child: ListView(
                        shrinkWrap: true,
                        children: [
                          Text(
                            'Sign Up',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Color(0xFFA51930),
                              fontSize: screenWidth * 0.1,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Arial',
                            ),
                          ),
                          SizedBox(height: screenHeight * 0.03),
                          CustomTextFormField(
                            keyboardType: TextInputType.emailAddress,
                            label: 'Email',
                            hint: 'john.doe@gmail.com',
                            controller: signUpCubit.emailController,
                            validationFunc: validateEmail,
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          CustomTextFormField(
                            keyboardType: TextInputType.text,
                            label: 'Username',
                            hint: 'john_doe',
                            controller: signUpCubit.usernameController,
                            validationFunc: validateUsername,
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          Row(
                            children: [
                              Expanded(
                                child: CustomTextFormField(
                                  keyboardType: TextInputType.text,
                                  label: 'First Name',
                                  hint: 'John',
                                  controller: signUpCubit.firstNameController,
                                  validationFunc: validateName,
                                ),
                              ),
                              SizedBox(width: 15),
                              Expanded(
                                child: CustomTextFormField(
                                  keyboardType: TextInputType.text,
                                  label: 'Last Name',
                                  hint: 'Doe',
                                  controller: signUpCubit.lastNameController,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          CustomTextFormField(
                            keyboardType: TextInputType.phone,
                            label: 'Phone Number',
                            hint: '+201234567890',
                            controller: signUpCubit.phoneNumberController,
                            validationFunc: validatePhoneNumber,
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          BlocBuilder<SignUpCubit, SignUpState>(
                            builder: (context, state) {
                              return CustomTextFormField(
                                isPassword: !state.isPasswordVisible,
                                keyboardType: TextInputType.text,
                                label: 'Password',
                                hint: 'Create password',
                                validationFunc: validatePassword,
                                controller: signUpCubit.passwordController,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    !state.isPasswordVisible
                                        ? Icons.visibility_rounded
                                        : Icons.visibility_off_rounded,
                                  ),
                                  onPressed:
                                      () =>
                                          signUpCubit
                                              .togglePasswordVisibility(),
                                ),
                              );
                            },
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          BlocBuilder<SignUpCubit, SignUpState>(
                            builder: (context, state) {
                              return CustomTextFormField(
                                isPassword: !state.isConfirmPasswordVisible,
                                keyboardType: TextInputType.text,
                                label: 'Confirm Password',
                                hint: 'Confirm Password',
                                validationFunc: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Password is required';
                                  } else if (value !=
                                      signUpCubit.passwordController.text) {
                                    return 'Passwords do not match';
                                  } else {
                                    return null;
                                  }
                                },
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    !state.isConfirmPasswordVisible
                                        ? Icons.visibility_rounded
                                        : Icons.visibility_off_rounded,
                                  ),
                                  onPressed:
                                      () =>
                                          signUpCubit
                                              .toggleConfirmPasswordVisibility(),
                                ),
                              );
                            },
                          ),
                          SizedBox(height: screenHeight * 0.025),
                          BlocBuilder<SignUpCubit, SignUpState>(
                            builder: (context, state) {
                              return ElevatedButton(
                                onPressed:
                                    state is SignUpLoading &&
                                            state.signUpMethod ==
                                                SignUpMethod.form
                                        ? null
                                        : () => signUpCubit.submitForm(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.black,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(vertical: 15),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  elevation: 0,
                                ),
                                child:
                                    state is SignUpLoading &&
                                            state.signUpMethod ==
                                                SignUpMethod.form
                                        ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2.0,
                                          ),
                                        )
                                        : const Text(
                                          'Sign Up',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                              );
                            },
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  height: 1,
                                  color: Color(0xFFE6E6E6),
                                ),
                              ),
                              SizedBox(width: 8),
                              Text(
                                'or',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
                                  fontFamily: 'Arial',
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Container(
                                  height: 1,
                                  color: Color(0xFFE6E6E6),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: screenHeight * 0.02),
                          BlocBuilder<SignUpCubit, SignUpState>(
                            builder: (context, state) {
                              return ElevatedButton(
                                onPressed:
                                    state is SignUpLoading &&
                                            state.signUpMethod ==
                                                SignUpMethod.google
                                        ? null
                                        : () async {
                                          signUpCubit.signUpWithGoogle();
                                        },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey.shade300,
                                  foregroundColor: Colors.black,
                                  padding: EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  elevation: 0,
                                ),
                                child:
                                    state is SignUpLoading &&
                                            state.signUpMethod ==
                                                SignUpMethod.google
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
                                              '''assets/google.png''',
                                              width: 24,
                                              height: 24,
                                            ),
                                            const SizedBox(width: 10),
                                            const Text(
                                              '''Continue with Google''',
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
                          SizedBox(height: screenHeight * 0.03),
                          Text.rich(
                            textAlign: TextAlign.center,
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Already have an account? ',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontFamily: 'Arial',
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                TextSpan(
                                  text: 'Login',
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
                                                  ) => LoginPage(),
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
