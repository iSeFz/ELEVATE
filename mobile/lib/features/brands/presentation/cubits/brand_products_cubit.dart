import 'package:flutter_bloc/flutter_bloc.dart';
// import '../../data/services/brand_service.dart';
import 'package:elevate/features/product_details/data/services/product_service.dart';
import 'package:elevate/features/product_details/data/models/product_card_model.dart';

abstract class BrandProductsState {}

class BrandProductsInitial extends BrandProductsState {}
class BrandProductsLoading extends BrandProductsState {}
class BrandProductsLoaded extends BrandProductsState {
  final List<ProductCardModel> products;
  final bool hasNextPage;
  final int currentPage;
  final bool isLoadingMore;
  BrandProductsLoaded({required this.products, required this.hasNextPage, required this.currentPage, this.isLoadingMore = false});
}
class BrandProductsError extends BrandProductsState {
  final String message;
  BrandProductsError(this.message);
}

class BrandProductsCubit extends Cubit<BrandProductsState> {
  final ProductService _productService = ProductService();
  BrandProductsCubit() : super(BrandProductsInitial());

  List<ProductCardModel> _products = [];
  int _currentPage = 1;
  bool _hasNextPage = true;
  bool _isLoadingMore = false;

  void fetchInitial(String brandId) async {
    emit(BrandProductsLoading());
    _products = [];
    _currentPage = 1;
    _hasNextPage = true;
    try {
      final result = await _productService.getProductsByBrand(brandId: brandId, page: 1);
      _products = List<ProductCardModel>.from(result['products']);
      final pagination = result['pagination'];
      _hasNextPage = pagination['hasNextPage'] == true || pagination['hasNextPage'] == 1;
      emit(BrandProductsLoaded(products: _products, hasNextPage: _hasNextPage, currentPage: 2));
    } catch (e) {
      emit(BrandProductsError(e.toString()));
    }
  }

  void loadMore(String brandId) async {
    if (!_hasNextPage || _isLoadingMore) return;
    _isLoadingMore = true;
    if (state is BrandProductsLoaded) {
      emit(BrandProductsLoaded(products: _products, hasNextPage: _hasNextPage, currentPage: _currentPage, isLoadingMore: true));
    }
    try {
      final result = await _productService.getProductsByBrand(brandId: brandId, page: _currentPage);
      final newProducts = List<ProductCardModel>.from(result['products']);
      final pagination = result['pagination'];
      _products.addAll(newProducts);
      _hasNextPage = pagination['hasNextPage'] == true || pagination['hasNextPage'] == 1;
      _currentPage++;
      emit(BrandProductsLoaded(products: _products, hasNextPage: _hasNextPage, currentPage: _currentPage, isLoadingMore: false));
    } catch (e) {
      emit(BrandProductsError(e.toString()));
    } finally {
      _isLoadingMore = false;
    }
  }

  void refresh(String brandId) async {
    fetchInitial(brandId);
  }
} 