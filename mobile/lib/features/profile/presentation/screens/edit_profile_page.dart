import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/widgets/custom_text_form_field.dart';
import '../../../../core/utils/validations.dart';
import '../cubits/profile_cubit.dart';
import '../cubits/profile_state.dart';
import '../widgets/profile_picture_dialog.dart';
import 'manage_addresses_page.dart';

class EditProfilePage extends StatelessWidget {
  const EditProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final profileCubit = context.read<ProfileCubit>();

    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'Edit Profile',
          style: TextStyle(
            color: theme.colorScheme.secondary,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        centerTitle: true,
        iconTheme: IconThemeData(color: theme.colorScheme.secondary),
      ),
      body: BlocConsumer<ProfileCubit, ProfileState>(
        listener: (context, state) {
          if (state is ProfileError) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text('Error: ${state.message}')));
          } else if (state is ProfileUpdated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile updated successfully!')),
            );
          } else if (state is ProfilePictureUpdated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Profile photo updated successfully!\nClick Save Changes to apply changes.',
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          return Padding(
            padding: EdgeInsets.symmetric(
              horizontal: screenWidth * 0.07,
              vertical: screenHeight * 0.02,
            ),
            child: SingleChildScrollView(
              child: Form(
                key: profileCubit.formKey,
                child: Column(
                  children: [
                    Center(
                      child: GestureDetector(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return BlocProvider.value(
                                value: profileCubit,
                                child: const ProfilePictureDialog(),
                              );
                            },
                          );
                        },
                        child: Stack(
                          alignment: Alignment.bottomRight,
                          children: [
                            // Customer profile photo
                            CircleAvatar(
                              radius: screenWidth * 0.2,
                              backgroundColor: theme
                                  .colorScheme
                                  .primaryContainer
                                  .withAlpha(50),
                              backgroundImage:
                                  profileCubit.imageURL.isNotEmpty
                                      ? NetworkImage(profileCubit.imageURL)
                                      : null,
                              child:
                                  profileCubit.imageURL.isEmpty
                                      ? Icon(
                                        Icons.person,
                                        size: screenWidth * 0.2,
                                        color:
                                            theme.colorScheme.primaryContainer,
                                      )
                                      : null,
                            ),
                            Positioned(
                              right: 5,
                              bottom: 5,
                              child: CircleAvatar(
                                backgroundColor: theme.colorScheme.primary,
                                radius: screenWidth * 0.05,
                                child: Icon(
                                  Icons.edit,
                                  color: Colors.white,
                                  size: screenWidth * 0.06,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.03),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        vertical: screenHeight * 0.01,
                      ),
                      child: CustomTextFormField(
                        label: 'Email',
                        controller: profileCubit.emailController,
                        enabled: false,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        vertical: screenHeight * 0.01,
                      ),
                      child: CustomTextFormField(
                        label: 'Username',
                        initialValue: profileCubit.customer?.username ?? "",
                        validationFunc: validateUsername,
                      ),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              vertical: screenHeight * 0.01,
                            ),
                            child: CustomTextFormField(
                              label: 'First Name',
                              controller: profileCubit.firstNameController,
                              validationFunc: validateName,
                              onChanged:
                                  (value) => profileCubit.fieldChanged(
                                    'firstName',
                                    value,
                                  ),
                            ),
                          ),
                        ),
                        SizedBox(width: screenWidth * 0.03),
                        Expanded(
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              vertical: screenHeight * 0.01,
                            ),
                            child: CustomTextFormField(
                              label: 'Last Name',
                              controller: profileCubit.lastNameController,
                              validationFunc: validateName,
                              onChanged:
                                  (value) => profileCubit.fieldChanged(
                                    'lastName',
                                    value,
                                  ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        vertical: screenHeight * 0.01,
                      ),
                      child: CustomTextFormField(
                        label: 'Phone',
                        controller: profileCubit.phoneController,
                        keyboardType: TextInputType.phone,
                        validationFunc: validatePhoneNumber,
                        onChanged:
                            (value) =>
                                profileCubit.fieldChanged('phoneNumber', value),
                      ),
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: screenWidth * 0.02,
                        vertical: screenHeight * 0.007,
                      ),
                      leading: Icon(
                        Icons.location_on_outlined,
                        color: Theme.of(context).colorScheme.primary,
                        size: screenWidth * 0.07,
                      ),
                      title: Text(
                        'Manage Addresses',
                        style: TextStyle(
                          fontSize: screenWidth * 0.045,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      trailing: Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: screenWidth * 0.05,
                        color: Colors.grey,
                      ),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder:
                                (context) => BlocProvider.value(
                                  value: profileCubit,
                                  child: const ManageAddressesPage(),
                                ),
                          ),
                        );
                      },
                    ),
                    SizedBox(height: screenHeight * 0.02),
                    // Save Changes Button
                    SizedBox(
                      width: screenWidth * 0.8,
                      height: screenHeight * 0.06,
                      child: BlocBuilder<ProfileCubit, ProfileState>(
                        builder: (context, state) {
                          bool isLoading = state is ProfileLoading;
                          return ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  isLoading
                                      ? Colors.grey
                                      : Theme.of(context).colorScheme.primary,
                              padding: EdgeInsets.symmetric(
                                vertical: screenHeight * 0.01,
                              ),
                              textStyle: TextStyle(
                                fontSize: screenWidth * 0.045,
                                fontWeight: FontWeight.bold,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            onPressed:
                                isLoading
                                    ? null
                                    : () {
                                      profileCubit.submitProfileUpdate();
                                    },
                            child:
                                isLoading
                                    ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                    : const Text(
                                      'Save Changes',
                                      style: TextStyle(color: Colors.white),
                                    ),
                          );
                        },
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.02),
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
