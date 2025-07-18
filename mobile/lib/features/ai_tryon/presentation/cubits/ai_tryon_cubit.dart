import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:async';
import 'ai_tryon_state.dart';
import '../../data/services/ai_tryon_service.dart';

class AITryOnCubit extends Cubit<AITryOnState> {
  AITryOnCubit({required this.productImage, required this.customerID})
    : super(AITryOnInitial());

  String productImage;
  final String customerID;
  final TryOnService _tryOnService = TryOnService();
  File? customerSelectedImage;
  String? customerUploadedImageURL;
  String? resultImageURL;
  String? platform = 'falAI';

  // Getter for the AI try on model platform
  bool get aiModelPlatform => platform == 'falAI';

  // Set the product image in the cubit
  void setProductImage(String newImage) {
    productImage = newImage;
  }

  // Set the AI model to be used for try-on
  void setAITryOnModel(String model) {
    platform = model;
    emit(AIModelChanged());
  }

  // Pick an image from the photo library or camera
  Future<void> selectImage(String imageSource) async {
    try {
      // Clear previous selection to avoid wrong data
      customerSelectedImage = null;
      customerUploadedImageURL = null;
      resultImageURL = null;

      emit(AITryOnLoading());

      // Use ImagePicker to select an image from the gallery or camera
      XFile? selectedImage = await ImagePicker().pickImage(
        source:
            imageSource == "camera" ? ImageSource.camera : ImageSource.gallery,
        imageQuality: 90,
      );

      if (selectedImage != null) {
        // Convert XFile to File
        final File imageFile = File(selectedImage.path);

        // Save the cropped image file for uploading later
        customerSelectedImage = imageFile;
        customerUploadedImageURL = imageFile.path;
        emit(PictureSelected());
      } else {
        emit(AITryOnFailure("No image selected."));
      }
    } catch (e) {
      emit(AITryOnFailure('Failed to process image: $e'));
    }
  }

  // Upload the image to Firebase Storage
  Future<void> uploadSelectedImage() async {
    try {
      // Upload the image to Firebase Storage
      customerUploadedImageURL = await _tryOnService.uploadImage(
        customerID,
        customerSelectedImage!,
      );
      emit(PictureUploaded());
    } catch (e) {
      emit(AITryOnFailure("Failed to upload customer image: $e"));
    }
  }

  // Send the try on request and wait for the result
  Future<void> tryOnProduct() async {
    if (customerUploadedImageURL == null) {
      emit(AITryOnFailure('No image uploaded'));
      return;
    }

    try {
      emit(AITryOnLoading());
      // Upload the image to firebase storage to get a link for it
      await uploadSelectedImage();

      // Send the try on request with the updated image URL
      final tryOnResponse = await _tryOnService.tryOnRequest(
        productImage,
        customerUploadedImageURL!,
        customerID,
        platform ?? 'falAI',
      );

      if (tryOnResponse == true) {
        emit(AITryOnSuccess());

        // Listen for the completed try-on result from Firebase Realtime Database
        _tryOnService
            .listenToTryOnStatus(customerID)
            .listen(
              (resultUrl) {
                if (resultUrl != null) {
                  resultImageURL = resultUrl;
                  emit(AITryOnResultReady());
                }
              },
              onError: (error) {
                emit(
                  AITryOnFailure('Error listening for try-on result: $error'),
                );
              },
            );
      } else {
        emit(AITryOnFailure('Failed to process try-on request'));
      }
    } catch (e) {
      emit(AITryOnFailure('Error during try-on: $e'));
    }
  }
}
