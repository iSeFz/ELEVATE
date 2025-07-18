import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/ai_tryon_cubit.dart';
import '../screens/ai_tryon_preview_page.dart';

class AITryOnDialog extends StatelessWidget {
  const AITryOnDialog({super.key});

  void _navigateToPreview(
    BuildContext context,
    AITryOnCubit aiTryOnCubit,
    String imageSource,
  ) {
    aiTryOnCubit.selectImage(imageSource);
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) => BlocProvider<AITryOnCubit>.value(
              value: aiTryOnCubit,
              child: AITryonPreviewPage(),
            ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final aiTryOnCubit = context.read<AITryOnCubit>();
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Stack(
      children: [
        // Floating instructions card
        Positioned(
          top: 60,
          left: 40,
          right: 40,
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(
                    context,
                  ).colorScheme.primary.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${String.fromCharCode(0x1F4F7)} Photo Instructions',
                        style: TextStyle(
                          fontSize: screenWidth * 0.045,
                          fontWeight: FontWeight.bold,
                          color:
                              Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'For best results:\n'
                    '• Stand straight facing the camera\n'
                    '• Ensure good lighting\n'
                    '• Keep arms slightly away from body\n'
                    '• Make sure your full upper body is visible',
                    style: TextStyle(
                      fontSize: screenWidth * 0.035,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // Image source dialog
        AlertDialog(
          title: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'AI Try-Before-You-Buy',
                style: TextStyle(
                  fontSize: screenWidth * 0.05,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(width: screenHeight * 0.005),
              Icon(Icons.auto_awesome, color: Colors.yellow.shade700),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Select an image source',
                style: TextStyle(fontSize: screenWidth * 0.04),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: screenHeight * 0.02),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  GestureDetector(
                    onTap:
                        () =>
                            _navigateToPreview(context, aiTryOnCubit, "camera"),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.photo_camera,
                          size: screenWidth * 0.12,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        SizedBox(height: screenHeight * 0.01),
                        Text(
                          'Camera',
                          style: TextStyle(fontSize: screenWidth * 0.04),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: screenWidth * 0.02),
                  GestureDetector(
                    onTap:
                        () =>
                            _navigateToPreview(context, aiTryOnCubit, "photos"),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.photo_library,
                          size: screenWidth * 0.12,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        SizedBox(height: screenHeight * 0.01),
                        Text(
                          'Photos',
                          style: TextStyle(fontSize: screenWidth * 0.04),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
