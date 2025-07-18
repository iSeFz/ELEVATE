import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../widgets/ai_model_toggle.dart';
import '../widgets/settings_item.dart';
import '../../../ai_tryon/presentation/cubits/ai_tryon_cubit.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _isDarkModeEnabled = false;
  String? _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final aiTryOnCubit = context.read<AITryOnCubit>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Settings',
          style: TextStyle(
            color: theme.colorScheme.secondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: IconThemeData(color: theme.colorScheme.secondary),
      ),
      backgroundColor: Colors.grey[50],
      body: Padding(
        padding: EdgeInsets.all(screenWidth * 0.04),
        child: ListView(
          children: [
            SettingsItem(
              title: 'Dark Mode',
              icon: Icons.dark_mode_outlined,
              trailing: Switch(
                value: _isDarkModeEnabled,
                onChanged: (value) {
                  setState(() {
                    _isDarkModeEnabled = value;
                  });
                },
                activeColor: theme.colorScheme.primary,
                inactiveThumbColor: Colors.grey,
              ),
            ),
            SizedBox(height: screenHeight * 0.025),
            SettingsItem(
              title: 'App Language',
              icon: Icons.language_outlined,
              trailing: DropdownButtonHideUnderline(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.03),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(screenWidth * 0.02),
                    border: Border.all(
                      color: theme.colorScheme.primary.withAlpha(125),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withAlpha(25),
                        spreadRadius: screenWidth * 0.0025,
                        blurRadius: screenWidth * 0.0075,
                        offset: Offset(0, screenHeight * 0.00125),
                      ),
                    ],
                  ),
                  child: DropdownButton<String>(
                    value: _selectedLanguage,
                    icon: Icon(
                      Icons.arrow_drop_down_rounded,
                      color: theme.colorScheme.primary,
                    ),
                    elevation: 2,
                    style: TextStyle(
                      color: theme.textTheme.bodyLarge?.color,
                      fontSize: screenWidth * 0.04,
                    ),
                    dropdownColor: Colors.white,
                    borderRadius: BorderRadius.circular(screenWidth * 0.02),
                    items:
                        <String>[
                          'English',
                          'Arabic',
                        ].map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedLanguage = newValue;
                      });
                    },
                  ),
                ),
              ),
            ),
            SizedBox(height: screenHeight * 0.025),
            BlocProvider.value(value: aiTryOnCubit, child: AIModelToggle()),
          ],
        ),
      ),
    );
  }
}
