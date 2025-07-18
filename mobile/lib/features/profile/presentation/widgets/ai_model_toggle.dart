import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../ai_tryon/presentation/cubits/ai_tryon_cubit.dart';
import '../../../ai_tryon/presentation/cubits/ai_tryon_state.dart';

class AIModelToggle extends StatelessWidget {
  const AIModelToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: screenWidth * 0.04,
        vertical: screenHeight * 0.015,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(screenWidth * 0.03),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(40),
            spreadRadius: screenWidth * 0.0025,
            blurRadius: screenWidth * 0.0125,
            offset: Offset(0, screenHeight * 0.0025),
          ),
        ],
      ),
      child: BlocBuilder<AITryOnCubit, AITryOnState>(
        builder: (context, state) {
          final aiTryOnCubit = context.read<AITryOnCubit>();
          return Row(
            children: [
              Icon(
                Icons.auto_awesome_rounded,
                color: theme.colorScheme.primary,
                size: screenWidth * 0.07,
              ),
              SizedBox(width: screenWidth * 0.04),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Replicate',
                        style: TextStyle(
                          fontSize: screenWidth * 0.04,
                          fontWeight: FontWeight.w500,
                          color:
                              !aiTryOnCubit.aiModelPlatform
                                  ? theme.colorScheme.primary
                                  : Colors.grey,
                        ),
                      ),
                    ),
                    Switch(
                      value: aiTryOnCubit.aiModelPlatform,
                      onChanged: (value) {
                        aiTryOnCubit.setAITryOnModel(
                          value ? 'falAI' : 'replicate',
                        );
                      },
                      activeColor: theme.colorScheme.primary,
                      inactiveThumbColor: Colors.grey,
                    ),
                    Expanded(
                      child: Text(
                        'FalAI',
                        textAlign: TextAlign.end,
                        style: TextStyle(
                          fontSize: screenWidth * 0.04,
                          fontWeight: FontWeight.w500,
                          color:
                              aiTryOnCubit.aiModelPlatform
                                  ? theme.colorScheme.primary
                                  : Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
