import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/cart_item.dart';

class CartItemCard extends StatelessWidget {
  final CartItem item;
  final int index;
  final void Function(int index, int newQuantity) onQuantityChanged;
  final void Function(int index) onRemoveItem;

  const CartItemCard({
    super.key,
    required this.item,
    required this.index,
    required this.onQuantityChanged,
    required this.onRemoveItem,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 100,
              height: 120,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  item.imageURL,
                  fit: BoxFit.cover,
                  errorBuilder:
                      (context, error, stackTrace) => Container(
                        color: Colors.grey[300],
                        child: const Icon(Icons.broken_image, size: 60),
                      ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.productName
                        .split(' ')
                        .map((word) {
                          if (word.isEmpty) return '';
                          return word[0].toUpperCase() +
                              word.substring(1).toLowerCase();
                        })
                        .join(' '),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Brand: ${item.brandName}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  Text(
                    '${item.size} / ${item.colors.join(", ")}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  Text(
                    'In stock: ${item.productStock ?? "-"}',
                    style: const TextStyle(color: Colors.green, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "EGP ${item.price.toStringAsFixed(2)}",
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                DropdownButton<int>(
                  alignment: AlignmentDirectional.centerEnd,
                  value: item.quantity,
                  items: List.generate(
                    min(10, item.productStock ?? 10),
                    (i) => DropdownMenuItem(
                      value: i + 1,
                      child: Text(
                        '${i + 1}',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                  onChanged: (value) {
                    if (value != null) {
                      onQuantityChanged(index, value);
                    }
                  },
                ),
                IconButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder:
                          (context) => AlertDialog(
                            title: const Text('Remove Item'),
                            content: Text(
                              'Remove ${item.productName.split(' ').map((word) {
                                if (word.isEmpty) return '';
                                return word[0].toUpperCase() + word.substring(1).toLowerCase();
                              }).join(' ')} from your cart?',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  onRemoveItem(index);
                                },
                                child: const Text('Remove'),
                              ),
                            ],
                          ),
                    );
                  },
                  icon: const Icon(
                    Icons.delete_forever_outlined,
                    color: Colors.red,
                    size: 24,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
