abstract class AITryOnState {}

class AITryOnInitial extends AITryOnState {}

class AITryOnLoading extends AITryOnState {}

class CameraInitialized extends AITryOnState {}

class CameraSwitched extends AITryOnState {}

class PictureSelected extends AITryOnState {}

class PictureUploaded extends AITryOnState {}

class AITryOnSuccess extends AITryOnState {}

class AITryOnResultReady extends AITryOnState {}

class AIModelChanged extends AITryOnState {}

class AITryOnFailure extends AITryOnState {
  final String errorMessage;

  AITryOnFailure(this.errorMessage);
}
