abstract class CartState {}

class CartInitial extends CartState {}

class CartLoading extends CartState {}

class CartLoaded extends CartState {}

class CartItemLoading extends CartState {}

class CartQuantityUpdated extends CartState {}

class CartItemSuccess extends CartState {}

class CartEmpty extends CartState {}

class CartCheckoutLoading extends CartState {}

class CartCheckoutSuccess extends CartState {}

class CartError extends CartState {
  final String message;
  CartError({required this.message});
}
