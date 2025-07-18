import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/profile_cubit.dart';

class ProfilePictureDialog extends StatelessWidget {
  const ProfilePictureDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final profileCubit = context.read<ProfileCubit>();
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return AlertDialog(
      title: Text(
        'Choose an action',
        style: TextStyle(
          fontSize: screenWidth * 0.05,
          fontWeight: FontWeight.bold,
        ),
        textAlign: TextAlign.center,
      ),
      content: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          GestureDetector(
            onTap: () {
              profileCubit.pickImage("camera");
              Navigator.of(context).pop();
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.photo_camera,
                  size: screenWidth * 0.12,
                  color: Theme.of(context).colorScheme.primary,
                ),
                SizedBox(height: screenHeight * 0.01),
                Text('Camera', style: TextStyle(fontSize: screenWidth * 0.04)),
              ],
            ),
          ),
          SizedBox(width: screenWidth * 0.02),
          GestureDetector(
            onTap: () {
              profileCubit.pickImage("photos");
              Navigator.of(context).pop();
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.photo_library,
                  size: screenWidth * 0.12,
                  color: Theme.of(context).colorScheme.primary,
                ),
                SizedBox(height: screenHeight * 0.01),
                Text('Photos', style: TextStyle(fontSize: screenWidth * 0.04)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
