import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../../../../core/constants/constants.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_database/firebase_database.dart';

class TryOnService {
  Future<bool> tryOnRequest(
    String productImg,
    String personImg,
    String customerID,
    String platform,
  ) async {
    try {
      final response = await http.post(
        Uri.parse(
          "$apiBaseURL/v1/utilities/try-on/start?userId=$customerID&platform=$platform",
        ),
        headers: {
          testAuthHeader: testAuthValue,
          'Content-Type': 'application/json',
        },
        body: json.encode({'productImg': productImg, 'personImg': personImg}),
      );

      // Return true if the request was sent successfully
      return response.statusCode == 201;
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Upload the customer image to the firebase storage and get an imageURL
  Future<String> uploadImage(String customerID, File selectedImage) async {
    try {
      final storageRef = FirebaseStorage.instance.ref().child(
        'try-on/customer-images/${customerID}_${DateTime.now().millisecondsSinceEpoch}_tryon.png',
      );

      // Upload the file to Firebase Storage
      final uploadTask = storageRef.putFile(selectedImage);
      final snapshot = await uploadTask.whenComplete(() {});
      // Get the download URL of the uploaded image
      final downloadURL = await snapshot.ref.getDownloadURL();
      // Return the download URL of the uploaded image
      return downloadURL;
    } catch (e) {
      throw Exception('Error uploading image: $e');
    }
  }

  // Listen for try-on status and return the result (when progress = 100)
  Stream<String?> listenToTryOnStatus(String customerID) {
    return FirebaseDatabase.instance
        .ref('userTryOnStatus/$customerID/latest')
        .onValue
        .map((event) {
          if (event.snapshot.exists) {
            final data = event.snapshot.value as Map<dynamic, dynamic>?;
            if (data != null) {
              final progress = data['progress'] as int?;
              final resultUrl = data['resultUrl'] as String?;

              // Return the result URL when progress is 100
              if (progress == 100 && resultUrl != null) {
                return resultUrl;
              }
            }
          }
          return null;
        })
        .where((resultUrl) => resultUrl != null);
  }
}
