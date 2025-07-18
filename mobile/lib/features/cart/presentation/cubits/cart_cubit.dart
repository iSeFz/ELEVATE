import 'package:elevate/features/product_details/data/models/product_variant_model.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/local_database_service.dart';
import '../../../product_details/data/models/product_card_model.dart';
import '../../data/services/cart_service.dart';
import '../../data/models/cart_item.dart';
import 'cart_state.dart';

class CartCubit extends Cubit<CartState> {
  final CartService _cartService = CartService();
  final String userId;

  List<CartItem> _cartItems = [];
  static List<CartItem> _cartItemsStatic = [];
  double subtotal = 0.0;
  String? orderId;

  List<CartItem> get cartItems => _cartItems;
  double get cartItemsCount => subtotal;

  CartCubit({required this.userId}) : super(CartInitial());

  Future<void> fetchCartItems() async {
    emit(CartLoading());
    try {
      _cartItems = await _cartService.fetchCartItems(userId);
      _cartItemsStatic = List.from(_cartItems);
      await Future.wait(
        _cartItems.map((item) async {
          item.productStock = await _cartService.fetchProductStock(
            item.productId,
            item.variantId,
          );

          if (item.productStock != null && item.quantity > item.productStock!) {
            item.quantity = item.productStock!;
          }
        }),
      );

      subtotal = _cartItems.fold(
        0.0,
        (sum, item) => sum + item.price * item.quantity,
      );
      if (_cartItems.isNotEmpty) {
        emit(CartLoaded());
      } else {
        emit(CartEmpty());
      }
    } catch (e) {
      emit(CartError(message: e.toString()));
    }
  }

  Future<void> updateQuantity(int index, int newQuantity) async {
    final cartItem = _cartItems[index];

    try {
      // Fetch the current stock to ensure we have the latest value
      final currentStock = await _cartService.fetchProductStock(
        cartItem.productId,
        cartItem.variantId,
      );

      // Update the stock value in our local model
      _cartItems[index].productStock = currentStock;

      // Validate quantity against current stock
      if (newQuantity > currentStock) {
        newQuantity = currentStock;
        emit(
          CartError(
            message:
                "Quantity exceeds available stock. Updated to max available.",
          ),
        );
      }

      // if the newQuantity is valid
      _cartItems[index].quantity = newQuantity;
      await _cartService.updateQuantity(userId, cartItem.id!, newQuantity);
      subtotal = _cartItems.fold(
        0.0,
        (sum, item) => sum + item.price * item.quantity,
      );

      emit(CartQuantityUpdated());
    } catch (e) {
      emit(CartError(message: "Failed to update quantity: $e"));
    }
  }

  Future<void> removeFromCart({String variantId = '', int index = -1}) async {
    emit(CartItemLoading());
    try {
      String customerId = LocalDatabaseService.getCustomerId();
      if (index == -1) {
        int staticIndex = _cartItemsStatic.indexWhere((item) => item.variantId == variantId);

        final staticCartItem = _cartItemsStatic[staticIndex];
        await _cartService.removeItem(customerId, staticCartItem.id!);
        if(staticIndex != -1) {
          _cartItemsStatic.removeAt(staticIndex);
        }
      }
      else{
        final cartItem = _cartItems[index];
        await _cartService.removeItem(customerId, cartItem.id!);
        if(index != -1) {
          _cartItems.removeAt(index);
        }
      }
      emit(CartItemSuccess());

      if (_cartItems.isEmpty) {
        emit(CartEmpty());
      } else {
        emit(CartLoaded());
      }
    } catch (e) {
      emit(CartError(message: 'Failed to remove item:  $index $e'));
    }
  }

  Future<void> proceedToCheckout() async {
    emit(CartCheckoutLoading());
    try {
      orderId = await _cartService.proceedToCheckout(userId, _cartItems);
      emit(CartCheckoutSuccess());
    } catch (e) {
      // 1. Update product stock for all cart items
      await Future.wait(
        _cartItems.map((item) async {
          try {
            item.productStock = await _cartService.fetchProductStock(
              item.productId,
              item.variantId,
            );
            // If quantity exceeds stock, set it to stock
            if (item.productStock != null &&
                item.quantity > item.productStock!) {
              item.quantity = item.productStock!;
            }
          } catch (_) {}
        }),
      );

      // 2. Show a clear error message if it's a stock/quantity issue
      String userMessage =
          "Some products' quantity exceeds the available stock. Please review your cart.";
      emit(CartError(message: userMessage));
      if (_cartItems.isNotEmpty) {
        emit(CartLoaded());
      } else {
        emit(CartEmpty());
      }
    }
  }

  isInCart(String selectedVariantId) {
    return _cartItemsStatic.any((item) => item.variantId == selectedVariantId);
  }

  // *__from product_details page__*
  Future<void> addToCart(
    ProductCardModel product,
    ProductVariant selectedVariant,
  ) async {
    emit(CartItemLoading());
    try {
      String customerId = LocalDatabaseService.getCustomerId();
      CartItem? itemReturned = await _cartService.addItem(
        customerId,
        product.id,
        selectedVariant.id,
        1,
      );
      if (itemReturned.id != null) {
        _cartItems.add(itemReturned);
        _cartItemsStatic.add(itemReturned);
      }
      emit(CartItemSuccess());
    } catch (e) {
      emit(CartError(message: e.toString()));
    }
  }

  bool canProceedToCheckout() {
    // Check if any item in the cart has zero stock
    final hasOutOfStockItems = _cartItems.any(
      (item) => item.productStock == 0 || item.productStock == null,
    );

    return !hasOutOfStockItems && _cartItems.isNotEmpty;
  }
}
