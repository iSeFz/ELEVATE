import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'edit_profile_page.dart';
import 'change_password_page.dart';
import 'settings_page.dart';
import '../../../../core/utils/google_utils.dart';
import '../../../auth/presentation/screens/login_page.dart';
import '../../../auth/data/models/customer.dart';
import '../../../profile/presentation/cubits/profile_cubit.dart';
import '../../../profile/presentation/widgets/profile_page_option.dart';

// Profile Page
class ProfilePage extends StatelessWidget {
  final Customer customer;
  const ProfilePage({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    return BlocProvider(
      create: (context) => ProfileCubit()..initializeCustomer(customer),
      child: Builder(
        builder: (context) {
          final profileCubit = context.read<ProfileCubit>();

          return Scaffold(
            backgroundColor: Colors.white,
            appBar: AppBar(
              toolbarHeight: 70,
              centerTitle: true,
              backgroundColor: Colors.white,
              shadowColor: Colors.black26,
              title: Text(
                'Profile',
                style: TextStyle(
                  color: theme.colorScheme.secondary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            body: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: screenWidth * 0.07,
                  vertical: screenHeight * 0.01,
                ),
                child: Column(
                  children: [
                    // Customer profile photo
                    CircleAvatar(
                      radius: screenWidth * 0.2,
                      backgroundColor: theme.colorScheme.tertiary,
                      child: Icon(
                        Icons.person,
                        size: screenWidth * 0.2,
                        color: theme.colorScheme.onPrimaryContainer,
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.02),
                    // Customer name field
                    Text(
                      profileCubit.fullName,
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: theme.textTheme.titleLarge?.color,
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.015),
                    // Container for loyalty points
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.04,
                        vertical: screenHeight * 0.01,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECECEC),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.shade200,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 24,
                            color: Color(0xFFFFD700),
                          ),
                          SizedBox(width: screenWidth * 0.02),
                          Text(
                            profileCubit.loyaltyPoints,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.secondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.04),
                    // Container for the list of profile options
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.shade200,
                            spreadRadius: 2,
                            blurRadius: 5,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ListView(
                        shrinkWrap: true,
                        padding: EdgeInsets.symmetric(
                          vertical: screenHeight * 0.005,
                        ),
                        children: [
                          ProfilePageOption(
                            icon: Icons.edit_outlined,
                            text: 'Edit Profile',
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (context) => BlocProvider.value(
                                        value: profileCubit,
                                        child: const EditProfilePage(),
                                      ),
                                ),
                              );
                            },
                          ),
                          ProfilePageOption(
                            icon: Icons.lock_outline_rounded,
                            text: 'Change Password',
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (context) => const ChangePasswordPage(),
                                ),
                              );
                            },
                          ),
                          ProfilePageOption(
                            icon: Icons.history_outlined,
                            text: 'Order History',
                            onTap: () {
                              // TODO: Implement Order History navigation/action
                            },
                          ),
                          ProfilePageOption(
                            icon: Icons.settings_outlined,
                            text: 'Settings',
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SettingsPage(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.03),
                    // Logout Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: Icon(
                          Icons.logout,
                          color: Colors.white,
                          size: screenWidth * 0.06,
                        ),
                        label: const Text(
                          'Logout',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.secondary,
                          padding: EdgeInsets.symmetric(
                            vertical: screenHeight * 0.015,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(5),
                          ),
                        ),
                        onPressed: () {
                          signOutGoogle();
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const LoginPage(),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
