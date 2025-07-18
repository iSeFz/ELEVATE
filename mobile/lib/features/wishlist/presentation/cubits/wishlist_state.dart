// Wishlist Cubit Related States
abstract class WishlistState {}

class WishlistInitial extends WishlistState {}

class WishlistLoading extends WishlistState {}

class WishlistLoaded extends WishlistState {}

class WishlistProductRemoved extends WishlistState {}

class WishlistProductAdded extends WishlistState {}

class WishlistEmpty extends WishlistState {}

class WishlistError extends WishlistState {
  final String message;
  WishlistError({required this.message});
}
