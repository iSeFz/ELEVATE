import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../product_details/data/models/product_card_model.dart';
import '../../../product_details/data/services/product_service.dart';
import 'home_state.dart';

// Home Cubit
class HomeCubit extends Cubit<HomeState> {
  HomeCubit() : super(HomeInitial());

  final ProductService _productService = ProductService();
  List<ProductCardModel> _homePageProducts = [];
  int _currentPage = 1;
  bool _isLoadingMore = false;
  Map<String, List<ProductCardModel>> _departmentProducts = {};
  List<ProductCardModel> _topRatedProducts = [];

  List<ProductCardModel> get homePageProducts => _homePageProducts;
  bool get isLoadingMore => _isLoadingMore;
  Map<String, List<ProductCardModel>> get departmentProducts =>
      _departmentProducts;
  List<ProductCardModel> get topRatedProducts => _topRatedProducts;

  // Retrieve a single page of products
  Future<void> fetchProductPage(int pageNumber) async {
    if (pageNumber == 1) {
      emit(HomeLoading());
      _homePageProducts.clear();
      _currentPage = 1;
    } else {
      _isLoadingMore = true;
      emit(HomeLoadingMore());
    }

    try {
      final newProducts = await _productService.getProductPage(pageNumber);

      if (pageNumber == 1) {
        _homePageProducts = newProducts;
      } else {
        _homePageProducts.addAll(newProducts);
      }

      _currentPage = pageNumber;
      _isLoadingMore = false;

      if (_homePageProducts.isNotEmpty) {
        emit(HomeLoaded());
      } else {
        emit(HomeError(message: "No products found"));
      }
    } catch (e) {
      _isLoadingMore = false;
      emit(HomeError(message: e.toString()));
    }
  }

  // Load more products when the user scrolls to the bottom
  Future<void> loadMoreProducts() async {
    if (!_isLoadingMore) {
      await fetchProductPage(_currentPage + 1);
    }
  }

  Future<void> fetchProductsByDepartments(List<String> departments) async {
    emit(HomeLoading());
    Map<String, int> pages = {'Men': 2, 'Women': 1, 'Kids': 1};
    try {
      final results = await Future.wait(
        departments.map(
          (dept) => _productService.getProductsByDepartment(dept, pages[dept]!),
        ),
      );

      final Map<String, List<ProductCardModel>> grouped = {};

      // Ensure we don't access out-of-bounds indices
      for (int i = 0; i < departments.length && i < results.length; i++) {
        final departmentName = departments[i];
        final products = results[i];
        grouped[departmentName] = products;
      }

      _departmentProducts = grouped;

      // Check if we have any products at all
      final totalProducts = _departmentProducts.values.fold<int>(
        0,
        (sum, products) => sum + products.length,
      );

      if (totalProducts > 0) {
        emit(HomeLoaded());
      } else {
        emit(HomeError(message: "No products found in any department"));
      }
    } catch (e) {
      _departmentProducts = {}; // Reset to empty map on error
      emit(HomeError(message: "Failed to load products: ${e.toString()}"));
    }
  }

  Future<void> fetchTopRatedProducts({int page = 1}) async {
    emit(HomeLoading());
    try {
      final products = await _productService.getTopRatedProducts(page: page);
      _topRatedProducts = products;
      if (_topRatedProducts.isNotEmpty) {
        emit(HomeLoaded());
      } else {
        emit(HomeError(message: "No top rated products found"));
      }
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }
}
