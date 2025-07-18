import 'package:elevate/features/ai_tryon/presentation/widgets/ai_tryon_image_preview.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/ai_tryon_cubit.dart';
import '../cubits/ai_tryon_state.dart';

class AITryonPreviewPage extends StatelessWidget {
  const AITryonPreviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    final aiTryOnCubit = context.read<AITryOnCubit>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'AI Try-On Preview',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: BlocConsumer<AITryOnCubit, AITryOnState>(
        listener: (context, state) {
          if (state is AITryOnSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Try-on request sent successfully!'),
              ),
            );
          } else if (state is AITryOnResultReady) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Try-on result is ready!')),
            );
          } else if (state is AITryOnFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.errorMessage}')),
            );
          }
        },
        builder: (context, state) {
          return Column(
            children: [
              // Image display area
              Expanded(
                child: Container(
                  width: double.infinity,
                  margin: EdgeInsets.all(16),
                  child: BlocProvider.value(
                    value: aiTryOnCubit,
                    child: ImagePreview(),
                  ),
                ),
              ),
              // Bottom controls
              Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Try-On button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed:
                            state is AITryOnLoading ||
                                    state is AITryOnSuccess ||
                                    state is PictureUploaded
                                ? null
                                : () {
                                  aiTryOnCubit.tryOnProduct();
                                },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon:
                            state is AITryOnLoading
                                ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                                : const Icon(Icons.auto_awesome),
                        label: Text(
                          state is AITryOnLoading
                              ? 'Processing...'
                              : 'Try On Product',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Secondary action buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => aiTryOnCubit.selectImage("camera"),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.black,
                              side: BorderSide(color: Colors.grey.shade400),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Retake'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed:
                                () => aiTryOnCubit.selectImage("gallery"),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.black,
                              side: BorderSide(color: Colors.grey.shade400),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.photo_library),
                            label: const Text('Gallery'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
