abstract class OrderState {}

class OrderInitial extends OrderState {}

class OrderLoading extends OrderState {}

class OrderLoaded extends OrderState {}

class OrderReleased extends OrderState {}

class OrderPlaced extends OrderState {}

class OrderTimerExpired extends OrderState {}

class OrderError extends OrderState {
  final String message;
  OrderError(this.message);
}
