import 'dart:io';

import 'package:firebase_storage/firebase_storage.dart';

import '../../features/search/presentation/cubits/filter/filter_cubit.dart';

class FilterUtils {
  static List<String> getFacetsViewByOption(int option, FilterCubit cubit) {
    switch (option) {
      case 1:
        return cubit.categories;
      case 2:
        return cubit.brandsNames;
      case 3:
        return cubit.departments;
      case 4:
        return cubit.colors;
      case 5:
        return cubit.sizes;
      default:
        return [];
    }
  }

  static List<String> getSelectedFacetsByOption(int option, FilterCubit cubit) {
    switch (option) {
      case 1:
        return cubit.selectedCateg;
      case 2:
        return cubit.selectedBrands;
      case 3:
        return cubit.selectedDep;
      case 4:
        return cubit.selectedColors;
      case 5:
        return cubit.selectedSizes;
      default:
        return [];
    }
  }

  static void updateSelectedOptions(int filterOptions, List<String> selectedOptions, FilterCubit cubit) {
    switch (filterOptions) {
      case 1:
        cubit.updateSelectedCateg(selectedOptions);
        break;
      case 2:
        cubit.updateSelectedBrands(selectedOptions);
        break;
      case 3:
        cubit.updateSelectedDep(selectedOptions);
        break;
      case 4:
        cubit.updateSelectedColors(selectedOptions);
        break;
      case 5:
        cubit.updateSelectedSizes(selectedOptions);
        break;
      default:
        break;
    }
  }


  static Map<String, List<String>> getMappedCategories(List<String>categories){

      final Map<String, List<String>> mappedCategories = {};
      for (final item in categories) {
        if (item.contains(' - ')) {
          final parts = item.split(' - ');
          final key = parts[0].trim();
          final value = parts[1].trim();
          if (!mappedCategories.containsKey(key)) {
            mappedCategories[key] = [];
          }
          mappedCategories[key]!.add(value);
        } else {
          mappedCategories.putIfAbsent(item, () => []);
        }
      }

      return mappedCategories;

  }

  static String getShortSize(String size) {
    final regex = RegExp(r'^(X+)?(.*)$', caseSensitive: false);
    final match = regex.firstMatch(size);
    if (match != null) {
      final xPart = match.group(1) ?? '';
      final afterX = match.group(2)?.trim() ?? '';
      final firstLetter = afterX.isNotEmpty ? afterX[0].toUpperCase() : '';
      return '$xPart$firstLetter';
    } else {
      return size; // fallback
    }
  }
  static List<String> getshortSizes(List<String> sizesList) {
    return sizesList.map((size) => getShortSize(size)).toList();
  }
  static Future<String> uploadImage(String customerID, File selectedImage) async {
    try {
      final storageRef = FirebaseStorage.instance.ref().child(
        'image-search/${customerID}_${DateTime.now().millisecondsSinceEpoch}_imageSearch.png',
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
}
