import 'package:flutter/material.dart';
import '../../core/services/local_database_service.dart';
import '../auth/presentation/screens/login_page.dart';
import 'main_page.dart';

// Splash screen at the start of the app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _showLogo = false;

  @override
  void initState() {
    super.initState();
    _animateSequence();
  }

  Future<void> _animateSequence() async {
    // Wait for initial logo display
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _showLogo = true;
      });
    }

    // Wait for logo to appear then navigate
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      try {
        final customer = LocalDatabaseService.getCustomer();
        if (customer != null) {
          Navigator.pushReplacement(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  MainPage(customer: customer),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                return FadeTransition(opacity: animation, child: child);
              },
              transitionDuration: const Duration(seconds: 2),
            ),
          );
        }
      } catch (e) {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
            const LoginPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }



  @override
  Widget build(BuildContext context) {
    // Get screen dimensions
    final screenWidth = MediaQuery.of(context).size.width;

    // Calculate dynamic image size
    final imageSize = screenWidth * 0.7;

    // Return the main scaffold
    return Scaffold(
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Logo with fade in/out
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: _showLogo ? 1.0 : 0.0),
              duration: const Duration(milliseconds: 1500),
              // Fade in the logo
              builder: (context, opacity, child) {
                return Opacity(
                  opacity: opacity,
                  child: Image.asset(
                    'assets/elevate.png',
                    height: imageSize,
                    width: imageSize,
                    fit: BoxFit.contain,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
