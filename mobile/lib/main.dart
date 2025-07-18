import 'package:elevate/core/services/local_database_service.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'features/common/splash_screen.dart';
import 'core/utils/size_config.dart';

// Main function to start the run
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await LocalDatabaseService.initDatabase(); // Initialize the local database service
  runApp(const MyApp());
}

// Main app widget
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ELEVATE',
      theme: ThemeData(
        colorScheme: ColorScheme.light(
          primary: Color(0xFFA51930),
          secondary: Colors.black,
          tertiary: Color(0xFFE8BBC2),
        ),
      ),
      home: Builder(
        builder: (context) {
          SizeConfig().init(context);
          return SplashScreen();
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
