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