import 'dart:async';
import 'package:elevate/features/product_details/data/models/product_card_model.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/services/wishlist_service.dart';
import 'wishlist_state.dart';

// Wishlist Cubit
class WishlistCubit extends Cubit<WishlistState> {
  final WishlistService _wishlistService = WishlistService();
  List<ProductCardModel> _wishlistProducts = [];
  List<ProductCardModel> get wishlistProducts => _wishlistProducts;

  WishlistCubit() : super(WishlistInitial());

  Future<void> fetchWishlist(String userID) async {
    emit(WishlistLoading());
    try {
      _wishlistProducts = await _wishlistService.fetchWishlist(userID);
      if (_wishlistProducts.isNotEmpty) {
        emit(WishlistLoaded());
      } else {
        emit(WishlistEmpty());
      }
    } catch (e) {
      emit(WishlistError(message: e.toString()));
    }
  }

  // Check if a product is in the wishlist
  bool isProductInWishlist(String productID) {
    return _wishlistProducts.any((product) => product.id == productID);
  }

  // Add a product to the wishlist
  Future<void> addToWishlist(String userID, String productID) async {
    try {
      // Add to database (backend)
      ProductCardModel? addedProduct = await _wishlistService.addToWishlist(
        userID,
        productID,
      );

      // If the product was added successfully to the backend, update the local list
      if (addedProduct != null) {
        // Refresh the wishlist to get the updated list including the new product
        _wishlistProducts.add(addedProduct);
        emit(WishlistProductAdded());
      } else {
        emit(WishlistError(message: 'Failed to add product to wishlist'));
      }
    } catch (e) {
      emit(WishlistError(message: e.toString()));
    }
  }

  Future<void> removeFromWishlist(String userID, String productID) async {
    try {
      // Remove from database (backend)
      bool isRemoved = await _wishlistService.removeFromWishlist(
        userID,
        productID,
      );
      if (isRemoved) {
        // If the product was removed successfully from the backend, remove locally
        _wishlistProducts.removeWhere((product) => product.id == productID);
        emit(WishlistProductRemoved());

        // If the wishlist is empty after removal, emit WishlistEmpty state
        if (_wishlistProducts.isEmpty) {
          emit(WishlistEmpty());
        }
      } else {
        emit(WishlistError(message: 'Failed to remove product from wishlist'));
      }
    } catch (e) {
      emit(WishlistError(message: e.toString()));
    }
  }
}
