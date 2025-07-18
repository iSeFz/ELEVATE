import 'package:flutter/material.dart';
import 'package:camera/camera.dart';

class Camera extends StatefulWidget {
  const Camera({super.key});

  @override
  State<Camera> createState() => _CameraState();
}

class _CameraState extends State<Camera> with SingleTickerProviderStateMixin {
  late List<CameraDescription> cameras;
  CameraController? controller;
  late PageController _pageController;
  int _currentIndex = 1; // 0: Video, 1: Camera
  bool _isRecording = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
    _initCamera();
  }

  Future<void> _initCamera() async {
    cameras = await availableCameras();
    controller = CameraController(
      cameras[0],
      ResolutionPreset.medium,
      enableAudio: true,
    );
    await controller!.initialize();
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    controller?.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _toggleRecording() async {
    if (controller == null || !controller!.value.isInitialized) return;

    if (_isRecording) {
      await controller!.stopVideoRecording();
    } else {
      await controller!.prepareForVideoRecording();
      await controller!.startVideoRecording();
    }

    setState(() => _isRecording = !_isRecording);
  }

  void _onPageChanged(int index) {
    setState(() => _currentIndex = index);
  }

  void _onNavTap(int index) {
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabTitles = ['Video', 'Camera'];

    return Scaffold(
      backgroundColor: Colors.black,
      body: controller == null || !controller!.value.isInitialized
          ? const Center(child: CircularProgressIndicator())
          : Column(
        children: [
          const SizedBox(height: 20),
          // Tab title
          Text(
            tabTitles[_currentIndex],
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              onPageChanged: _onPageChanged,
              children: [
                // Video Mode
                Stack(
                  alignment: Alignment.center,
                  children: [
                    CameraPreview(controller!),
                    Positioned(
                      bottom: 100,
                      child: GestureDetector(
                        onTap: _toggleRecording,
                        child: CircleAvatar(
                          radius: 30,
                          backgroundColor: _isRecording ? Colors.red : Colors.white,
                          child: Icon(
                            _isRecording ? Icons.stop : Icons.videocam,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                // Camera Mode
                CameraPreview(controller!),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.only(bottom: 24, top: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildCircleIcon(Icons.video_camera_back_outlined, 0),
            _buildCircleIcon(Icons.camera_alt, 1, isCenter: true),
            _buildCircleIcon(Icons.photo_library_outlined, 2, isStatic: true),
          ],
        ),
      ),
    );
  }

  Widget _buildCircleIcon(IconData icon, int index, {bool isCenter = false, bool isStatic = false}) {
    final bool isSelected = _currentIndex == index;

    return GestureDetector(
      onTap: isStatic ? null : () => _onNavTap(index),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.1),
          shape: BoxShape.circle,
          border: isCenter
              ? Border.all(color: Colors.white, width: 2)
              : null,
        ),
        child: Icon(
          icon,
          color: Theme.of(context).primaryColor,
          size: isCenter ? 30 : 24,
        ),
      ),
    );
  }
}
