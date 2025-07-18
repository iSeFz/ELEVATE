import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:io';
import '../cubits/ai_tryon_cubit.dart';
import '../cubits/ai_tryon_state.dart';

class ImagePreview extends StatelessWidget {
  const ImagePreview({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AITryOnCubit, AITryOnState>(
      builder: (context, state) {
        final aiTryOnCubit = context.read<AITryOnCubit>();

        // Show loading state
        if (state is AITryOnLoading || state is AITryOnSuccess) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text(
                  'Processing your image...',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        // Determine which image URL to use and badge properties
        final String? imageURL =
            state is AITryOnResultReady
                ? aiTryOnCubit.resultImageURL
                : aiTryOnCubit.customerUploadedImageURL;

        final String badgeText =
            state is AITryOnResultReady ? 'Result' : 'Original';
        final Color badgeColor =
            state is AITryOnResultReady
                ? Colors.green
                : Theme.of(context).primaryColor;

        // Show no image placeholder
        if (imageURL == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.image_not_supported_rounded,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'No image selected',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        // Show image with badge
        return Stack(
          children: [
            // Check if the URL is a local file path or a network URL
            imageURL.startsWith('http')
                ? Image.network(
                  imageURL,
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    return loadingProgress == null
                        ? child
                        : Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 16),
                              Text(
                                'Loading your image...',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error,
                            size: 48,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Failed to load ${badgeText.toLowerCase()} image',
                          ),
                        ],
                      ),
                    );
                  },
                )
                : // Display local image file
                Image.file(
                  File(imageURL),
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error,
                            size: 48,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Failed to load ${badgeText.toLowerCase()} image',
                          ),
                        ],
                      ),
                    );
                  },
                ),
            Positioned(
              top: 45,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  badgeText,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
