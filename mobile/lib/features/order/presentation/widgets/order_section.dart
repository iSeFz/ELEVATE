import 'package:flutter/material.dart';

class OrderSection extends StatelessWidget {
  final String label;
  final dynamic content;
  final bool isPlaceholder;
  final bool showArrow;
  final bool disabled;
  final bool showEditIcon;

  const OrderSection({
    super.key,
    required this.label,
    required this.content,
    this.isPlaceholder = false,
    this.showArrow = true,
    this.disabled = false,
    this.showEditIcon = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: const Border(
          bottom: BorderSide(color: Color(0xFFE6E6E6), width: 0.5),
        ),
        color: disabled ? const Color(0xFFF5F5F5) : Colors.white,
      ),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: disabled ? Colors.grey : Colors.black,
              ),
            ),
          ),
          Expanded(
            child:
                content is List
                    ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children:
                          (content as List)
                              .map(
                                (line) => Text(
                                  line.toString(),
                                  style: TextStyle(
                                    fontSize: 14,
                                    color:
                                        disabled
                                            ? Colors.grey
                                            : (isPlaceholder
                                                ? Colors.black38
                                                : Colors.black),
                                  ),
                                ),
                              )
                              .toList(),
                    )
                    : Text(
                      content.toString(),
                      style: TextStyle(
                        fontSize: 14,
                        color:
                            disabled
                                ? Colors.grey
                                : (isPlaceholder
                                    ? Colors.black38
                                    : Colors.black),
                      ),
                    ),
          ),
          if (showEditIcon)
            Icon(
              Icons.edit,
              size: 20,
              color: disabled ? Colors.grey : Colors.black,
            )
          else if (showArrow)
            Icon(
              Icons.chevron_right,
              size: 20,
              color: disabled ? Colors.grey : Colors.black,
            ),
        ],
      ),
    );
  }
}
