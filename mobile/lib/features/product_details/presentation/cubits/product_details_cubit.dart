import 'package:bloc/bloc.dart';
import 'package:elevate/features/product_details/data/models/product_card_model.dart';
import 'package:elevate/features/product_details/presentation/cubits/product_details_state.dart';
import '../../data/models/product_details_model.dart';
import '../../data/services/product_service.dart';

// Cubit class
class ProductDetailsCubit extends Cubit<ProductDetailsState> {
  ProductDetailsCubit() : super(ProductDetailsInitial());

  Future<void> fetchProductDetails(String productId) async {
    try {
      emit(ProductDetailsLoading());

      // Call static method directly
      ProductDetailsModel product = await ProductService.getProductDetails(
        productId,
      );
      emit(
        ProductDetailsLoaded(
          product: product,
          selectedSizeId:
              product.variants.isNotEmpty ? product.variants.first.id : null,
          similarProducts: [],
          customerViewedProducts: [],
        ),
      );
      fetchSimilarProducts(productId);
      fetchCustomerViewedProducts(productId);
    } catch (e) {
      emit(ProductDetailsError(e.toString()));
    }
  }

  Future<void> fetchSimilarProducts(String productId) async {
    try {
      if (state is ProductDetailsLoaded) {
        List<ProductCardModel> similarProducts =
            await ProductService.getSimilarProducts(productId);
        emit(
          (state as ProductDetailsLoaded).copyWith(
            similarProducts: similarProducts,
          ),
        );
      }
    } catch (e) {
      print('Error fetching similar products: ${e.toString()}');
    }
  }

  Future<void> fetchCustomerViewedProducts(String productId) async {
    try {
      if (state is ProductDetailsLoaded) {
        List<ProductCardModel> customerViewedProducts =
            await ProductService.getCustomerViewedProducts(productId);
        emit(
          (state as ProductDetailsLoaded).copyWith(
            customerViewedProducts: customerViewedProducts,
          ),
        );
      }
    } catch (e) {
      print('Error fetching customer viewed products: ${e.toString()}');
    }
  }

  void selectSize(String id) {
    if (state is ProductDetailsLoaded) {
      emit((state as ProductDetailsLoaded).copyWith(selectedSizeId: id));
    }
  }
}
