import 'package:flutter/material.dart';
import '../../../../core/utils/size_config.dart';

class SizeContainer extends StatelessWidget {
  final String text;
  final bool selected;
  final VoidCallback onTap;

  const SizeContainer({
    super.key,
    required this.text,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40 * SizeConfig.horizontalBlock,
        height: 35 * SizeConfig.horizontalBlock,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: selected
              ? Theme.of(context).colorScheme.primary.withOpacity(0.1)
              : Colors.white,
          border: Border.all(
            color: selected ? const Color(0xFFA51930) : Colors.black,
            width: 1,
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 16 * SizeConfig.textRatio,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
      ),
    );
  }
}