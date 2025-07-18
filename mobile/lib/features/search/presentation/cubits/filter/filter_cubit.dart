import 'dart:io';

import 'package:elevate/core/services/local_database_service.dart';
import 'package:elevate/features/product_details/data/services/product_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../core/services/algolia_service.dart' show AlgoliaService;

import '../../../../../core/utils/filters_utils.dart';
import '../../../../product_details/data/models/product_card_model.dart';
import 'filter_state.dart';

class FilterCubit extends Cubit<FilterState> {
  FilterCubit() : super(FilterInitial());
  final AlgoliaService algoliaService = AlgoliaService();
  final ProductService productService = ProductService();

  List<ProductCardModel> _products = <ProductCardModel>[];
  List<ProductCardModel> get products => List.unmodifiable(_products);

  static List<String> _brandsNames = [];
  List<String> get brandsNames => List.unmodifiable(_brandsNames);

  static List<String> _departments = [];
  List<String> get departments => List.unmodifiable(_departments);

  static List<String> _categories= [];
  List<String> get categories => List.unmodifiable(_categories);

  static List<String> _colors= [];
  List<String> get colors => List.unmodifiable(_colors);

  static List<String> _sizes= [];
  List<String> get sizes => List.unmodifiable(_sizes);

  // selected lists
  List<String> _selectedCateg = [];
  List<String> get selectedCateg => _selectedCateg;

  List<String> _selectedDep = [];
  List<String> get selectedDep => _selectedDep;

  List<String> _selectedBrands = [];
  List<String> get selectedBrands => _selectedBrands;

  List<String> _selectedColors = [];
  List<String> get selectedColors => _selectedColors;

  List<String> _selectedSizes = [];
  List<String> get selectedSizes => _selectedSizes;

  Future<void> searchProductsByAlgolia({String query = ''}) async {
    emit(SearchLoading());
    try {
      final results = await algoliaService.searchProducts(query);

      if (results.isEmpty) {  // searchProducts already guarantees a list, no need to check for null
        emit(SearchEmpty());
        return;
      }
      List<ProductCardModel> cleanedProducts = [];

      for (var json in results) {
        try {
          if (json != null && json is Map<String, dynamic>) {
            cleanedProducts.add(ProductCardModel.fromJson(json));
          }
        } catch (e) {
          print('Skipping invalid product: $e');
          continue;
        }
      }
      if (cleanedProducts.isEmpty) {
        emit(SearchEmpty());
        return;
      }
      // Safely parse only valid JSON maps
      _products = List.from(cleanedProducts);

      emit(SearchLoaded());
    } catch (e) {
      emit(SearchError('Search failed: $e'));
    }
  }

  Future<void>SearchProductsByImage(String imagePath) async {
    emit(SearchLoading());
    try {
      final results = await productService.getImageSearchProducts(imageUrl: imagePath);

      if (results.isEmpty) {
        emit(SearchEmpty());
        return;
      }
      _products = List.from(results);

      emit(SearchLoaded());
    } catch (e) {
      emit(SearchError('Search failed: $e'));
    }
  }

  Future<void> pickImage({bool gallery=true}) async {
    try {
      final ImagePicker picker = ImagePicker();
      final pickedFile = gallery
          ? await picker.pickImage(source: ImageSource.gallery)
          : await picker.pickImage(source: ImageSource.camera);
      String customerID = LocalDatabaseService.getCustomerId();

      emit(ImageLoading());
      if (pickedFile != null) {
        String imagePath = await FilterUtils.uploadImage(customerID, File(pickedFile.path));
        emit(ImageLoaded());
        await SearchProductsByImage(imagePath);
      }
    } catch (e) {
      emit(ImageError('Failed to pick image: $e'));
      print('Failed to pick image: $e');
    }
  }

  void sortProductsByPrice({bool ascending = true}) {
    emit(SearchLoading());
    try {
      _products.sort((a, b) => ascending
          ? a.price.compareTo(b.price)
          : b.price.compareTo(a.price));
      emit(SearchLoaded());
    } catch (e) {
      emit(SearchError('Sorting failed: $e'));
    }
  }
  void sortProductsByName({bool ascending = true}) {
    try {
      _products.sort((a, b) => ascending
          ? a.name.toLowerCase().compareTo(b.name.toLowerCase())
          : b.name.toLowerCase().compareTo(a.name.toLowerCase()));

      emit(SearchLoaded());
    } catch (e) {
      emit(SearchError('Sorting by name failed: $e'));
    }
  }


  Future<void> getAllBrands() async {
    emit(FilterLoading());
    try {
      _brandsNames.clear();
      _brandsNames = await algoliaService.getStaticNames('brandName');
      emit(FilterLoaded());
    } catch (e) {
      emit(FilterError(e.toString()));
      rethrow;
    }
  }

  Future<void> getAllDepartments() async {
    emit(FilterLoading());
    try {
      _departments.clear();
      _departments = await ProductService.getAllDepartments();
      emit(FilterLoaded());
    } catch (e) {
      emit(FilterError(e.toString()));
      rethrow;
    }
  }

  Future<void> getAllCategories() async {
    emit(FilterLoading());
    try {
      _categories.clear();
      _categories = await ProductService.getAllCategories();
      emit(FilterLoaded());
    } catch (e) {
      emit(FilterError(e.toString()));
      rethrow;
    }
  }


  Future<void> getAllColors() async {
    emit(FilterLoading());
    try {
      _colors.clear();
      _colors = await algoliaService.getStaticNames('variants.colors');
      emit(FilterLoaded());
    } catch (e) {
      emit(FilterError(e.toString()));
      rethrow;
    }
  }

  Future<void> getAllSizes() async {
    emit(FilterLoading());
    try {
      _sizes.clear();
      // List<String> longSizes = await algoliaService.getStaticNames('variants.size');
      // _sizes = FilterUtils.getshortSizes(longSizes);
      _sizes = await algoliaService.getStaticNames('variants.size');
      emit(FilterLoaded());
    } catch (e) {
      emit(FilterError(e.toString()));
      rethrow;
    }
  }


  void updateSelectedBrands(List<String> selected) async {
    _selectedBrands.clear();
    _selectedBrands = List.from(selected);
    algoliaService.addFacets(_selectedBrands, 'brandName');

  }

  void updateSelectedDep(List<String> selected) async {
    _selectedDep.clear();
    _selectedDep = List.from(selected);
    algoliaService.addFacets(selected, 'department');

  }
  void updateSelectedCateg(List<String> selected) async {
    _selectedCateg.clear();
    _selectedCateg = List.from(selected);
    algoliaService.addFacets(selected, 'category');
    print('Selected Categories: $_selectedCateg');
  }

  void updateSelectedColors(List<String> selected) async {
    _selectedColors.clear();
    _selectedColors = List.from(selected);
    algoliaService.addFacets(selected, 'variants.colors');
    print('Selected Colors: $_selectedColors');
  }

  void updateSelectedSizes(List<String> selected) async {
    _selectedSizes.clear();
    _selectedSizes = List.from(selected);
    algoliaService.addFacets(selected, 'variants.size');
    print('Selected Sizes: $_selectedSizes');
  }
}