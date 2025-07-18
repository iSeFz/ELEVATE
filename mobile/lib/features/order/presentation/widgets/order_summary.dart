import 'package:flutter/material.dart';

class OrderSummary extends StatelessWidget {
  final double subtotal;
  final double shipmentFee;
  final int itemCount;

  const OrderSummary({
    super.key,
    required this.subtotal,
    required this.shipmentFee,
    required this.itemCount,
  });

  @override
  Widget build(BuildContext context) {
    final double total = subtotal + shipmentFee;

    final List<Map<String, dynamic>> summaryItems = [
      {
        'label': 'Subtotal ($itemCount)',
        'value': 'EGP ${subtotal.toStringAsFixed(2)}',
      },
      {
        'label': 'Shipment total',
        'value': 'EGP ${shipmentFee.toStringAsFixed(2)}',
      },
      {
        'label': 'Total',
        'value': 'EGP ${total.toStringAsFixed(2)}',
        'highlight': true,
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children:
            summaryItems.map((item) {
              final bool highlight = item['highlight'] == true;
              final String label = item['label'] ?? '';
              final String value = item['value'] ?? '';

              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 14,
                        color:
                            highlight ? const Color(0xFFA41930) : Colors.black,
                        fontWeight:
                            highlight ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                    Text(
                      value,
                      style: TextStyle(
                        fontSize: 14,
                        color:
                            highlight ? const Color(0xFFA41930) : Colors.black,
                        fontWeight:
                            highlight ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
      ),
    );
  }
}
