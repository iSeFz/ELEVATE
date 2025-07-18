// States
import '../../data/models/product_details_model.dart';
import '../../data/models/product_card_model.dart';

abstract class ProductDetailsState {
  get selectedSizeId => null;
  get similarProducts => null;
  get customerViewedProducts => null;
}

class ProductDetailsInitial extends ProductDetailsState {}

class ProductDetailsLoading extends ProductDetailsState {}

class ProductDetailsLoaded extends ProductDetailsState {
  final ProductDetailsModel product;
  final String? selectedSizeId;
  final List<ProductCardModel>? similarProducts;
  final List<ProductCardModel>? customerViewedProducts;

  ProductDetailsLoaded({
    required this.product,
    this.selectedSizeId,
    this.similarProducts,
    this.customerViewedProducts,
  });

  ProductDetailsLoaded copyWith({
    ProductDetailsModel? product,
    String? selectedSizeId,
    List<ProductCardModel>? similarProducts,
    List<ProductCardModel>? customerViewedProducts,
  }) {
    return ProductDetailsLoaded(
      product: product ?? this.product,
      selectedSizeId: selectedSizeId ?? this.selectedSizeId,
      similarProducts: similarProducts ?? this.similarProducts,
      customerViewedProducts: customerViewedProducts ?? this.customerViewedProducts,
    );
  }
}

class ProductDetailsError extends ProductDetailsState {
  final String message;
  ProductDetailsError(this.message);
}
