// --- Profile Related States ---
abstract class ProfileState {}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {}

class ProfileUpdated extends ProfileState {}

class ProfilePictureUpdated extends ProfileState {}

class ProfileError extends ProfileState {
  final String message;

  ProfileError({required this.message});
}

class PasswordChanged extends ProfileState {}

class ChangePasswordVisibilityChanged extends ProfileState {
  final bool isCurrentPasswordVisible;

  ChangePasswordVisibilityChanged({required this.isCurrentPasswordVisible});
}

// --- Address Related States ---
class AddressLoading extends ProfileState {}

class AddressSaved extends ProfileState {}

class AddressExpanded extends ProfileState {}

class DefaultAddressUpdated extends ProfileState {}

class AddressDeleted extends ProfileState {}

// --- Orders States ---
class OrdersLoading extends ProfileState {}

class OrdersLoaded extends ProfileState {}

class OrdersEmpty extends ProfileState {}

class OrderCancelled extends ProfileState {}

class RefundRequested extends ProfileState {}
