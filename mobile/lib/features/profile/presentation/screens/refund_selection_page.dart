import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../order/presentation/widgets/order_item_card.dart';
import '../../data/models/order.dart';
import '../cubits/profile_cubit.dart';
import '../cubits/profile_state.dart';

class RefundSelectionPage extends StatelessWidget {
  final Order order;

  const RefundSelectionPage({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            centerTitle: true,
            backgroundColor: Colors.white,
            shadowColor: Colors.black26,
            title: const Text(
              'Select Items to Refund',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            leading: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                context.read<ProfileCubit>().cancelRefundSelection();
                Navigator.of(context).pop();
              },
            ),
          ),
          body: BlocListener<ProfileCubit, ProfileState>(
            listener: (context, state) {
              if (state is RefundRequested) {
                Navigator.of(context).pop();
              } else if (state is ProfileError) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(state.message)));
              }
            },
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: _buildProductSelectionList(context),
                  ),
                ),
                _buildConfirmationButton(context),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductSelectionList(BuildContext context) {
    final orderItems = order.products ?? [];
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'Select the items you want to refund',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: orderItems.length,
          itemBuilder: (context, index) {
            final item = orderItems[index];
            final productKey = "${item.productId}:${item.variantId}";
            final isSelected =
                context
                    .watch<ProfileCubit>()
                    .selectedProductsForRefund[productKey] ??
                false;

            return Stack(
              children: [
                OrderItemCard(item: item),
                Positioned(
                  bottom: 4,
                  right: 12,
                  child: Checkbox(
                    value: isSelected,
                    onChanged: (checked) {
                      context.read<ProfileCubit>().toggleProductSelection(
                        item.productId,
                        item.variantId,
                      );
                    },
                    activeColor: Colors.red.shade800,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildConfirmationButton(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE6E6E6), width: 0.5)),
      ),
      child: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          return ElevatedButton(
            onPressed:
                state is OrdersLoading
                    ? null
                    : () => _showRefundConfirmationDialog(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child:
                state is OrdersLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                      'Confirm Selection',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
          );
        },
      ),
    );
  }

  void _showRefundConfirmationDialog(BuildContext context) {
    final cubit = context.read<ProfileCubit>();
    final selectedProducts = cubit.selectedProductsForRefund;

    int selectedCount = 0;
    selectedProducts.forEach((key, isSelected) {
      if (isSelected) selectedCount++;
    });

    if (selectedCount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one product to refund'),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Confirm Refund Request'),
          content: Text(
            'Are you sure you want to request a refund for $selectedCount selected item${selectedCount > 1 ? 's' : ''}?',
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                cubit.submitRefundRequest(order.id ?? '');
              },
              child: const Text('Request Refund'),
            ),
          ],
        );
      },
    );
  }
}
