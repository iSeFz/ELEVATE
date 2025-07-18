import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../order/presentation/widgets/order_summary.dart';
import '../../../order/presentation/widgets/order_item_card.dart';
import '../../../order/presentation/widgets/order_section.dart';
import '../../data/models/order.dart';
import '../cubits/profile_cubit.dart';
import '../cubits/profile_state.dart';
import 'refund_selection_page.dart';

class OrderDetailsPage extends StatelessWidget {
  final Order order;
  final int orderNumber;

  const OrderDetailsPage({
    super.key,
    required this.order,
    required this.orderNumber,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        // Always get the latest order from the cubit using the order's ID
        final orders = context.watch<ProfileCubit>().orders;
        final latestOrder = orders.firstWhere(
          (o) => o.id == order.id,
          orElse: () => order,
        );

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            centerTitle: true,
            backgroundColor: Colors.white,
            shadowColor: Colors.black26,
            title: Text(
              'Order #$orderNumber',
              style: TextStyle(
                color: Theme.of(context).colorScheme.secondary,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            leading: IconButton(
              icon: Icon(
                Icons.arrow_back,
                color: Theme.of(context).colorScheme.secondary,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          body: BlocListener<ProfileCubit, ProfileState>(
            listener: (context, state) {
              if (state is RefundRequested) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Refund request submitted successfully'),
                  ),
                );
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
                    child: Column(
                      children: [
                        _buildOrderSections(context, latestOrder),
                        _buildItems(context, latestOrder),
                      ],
                    ),
                  ),
                ),
                _buildBottomBar(context, latestOrder),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOrderSections(BuildContext context, Order order) {
    final sections = [
      {
        'label': 'Order Date',
        'content':
            order.createdAt != null
                ? '${order.createdAt!.day}/${order.createdAt!.month}/${order.createdAt!.year}'
                : 'Not available',
      },
      if (order.shipment?.method != null) ...[
        {
          'label':
              order.status == 'delivered'
                  ? 'Delivery Date'
                  : 'Estimated Delivery Date',
          'content':
              order.status == 'delivered' && order.shipment?.deliveredAt != null
                  ? '${order.shipment!.deliveredAt!.day}/${order.shipment!.deliveredAt!.month}/${order.shipment!.deliveredAt!.year}'
                  : order.shipment?.estimatedDeliveryDate != null
                  ? '${order.shipment!.estimatedDeliveryDate!.day}/${order.shipment!.estimatedDeliveryDate!.month}/${order.shipment!.estimatedDeliveryDate!.year}'
                  : 'To be determined',
        },
        {
          'label': 'Address',
          'content':
              order.address != null
                  ? '${order.address!.city}, ${order.address!.street}, Building ${order.address!.building}'
                  : 'No address provided',
        },
      ],
      {
        'label': 'Phone',
        'content':
            order.phoneNumber?.isNotEmpty == true
                ? order.phoneNumber!
                : 'No phone number',
      },
      {'label': 'Delivery', 'content': order.shipment?.method ?? 'Pickup'},
      {'label': 'Payment', 'content': 'Cash on delivery'},
    ];

    return Column(
      children:
          sections.map((section) {
            return OrderSection(
              label: section['label'] as String,
              content: section['content'] as String,
              showArrow: false,
            );
          }).toList(),
    );
  }

  Widget _buildItems(BuildContext context, Order order) {
    final cartItems = order.products ?? [];
    if (cartItems.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(10),
          child: Text(
            'Order Summary',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cartItems.length,
          itemBuilder: (context, index) {
            final item = cartItems[index];
            return OrderItemCard(item: item);
          },
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context, Order order) {
    final subtotal = order.price ?? 0.0;
    final shipmentFee = order.shipment?.fees ?? 0.0;
    final itemCount = order.products?.length ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE6E6E6), width: 0.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          OrderSummary(
            subtotal: subtotal,
            shipmentFee: shipmentFee,
            itemCount: itemCount,
          ),
          const SizedBox(height: 12),
          if (order.status == 'processing')
            _buildCancelOrderButton(context, order)
          else if (_canRequestRefund(order))
            _buildRequestRefundButton(context, order),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildCancelOrderButton(BuildContext context, Order order) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listener: (context, state) {
        if (state is OrderCancelled) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Order cancelled successfully')),
          );
          Navigator.of(context).pop();
        } else if (state is ProfileError) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        return ElevatedButton(
          onPressed:
              state is OrdersLoading
                  ? null
                  : () {
                    context.read<ProfileCubit>().cancelOrder(order.id ?? '');
                  },
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
                    'Cancel order',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
        );
      },
    );
  }

  Widget _buildRequestRefundButton(BuildContext context, Order order) {
    return ElevatedButton(
      onPressed: () {
        final profileCubit = context.read<ProfileCubit>();
        profileCubit.startRefundSelection(order.id ?? '');

        Navigator.of(context).push(
          MaterialPageRoute(
            builder:
                (newContext) => BlocProvider.value(
                  value: profileCubit,
                  child: RefundSelectionPage(order: order),
                ),
          ),
        );
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.black,
        minimumSize: const Size.fromHeight(50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: const Text(
        'Request Refund',
        style: TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  bool _canRequestRefund(Order order) {
    // Order is delivered
    if (order.status != 'delivered') return false;

    // Delivery date exists (Not Pickup)
    if (order.shipment?.deliveredAt == null) return false;

    // Order is within 14 days of delivery
    final deliveryDate = order.shipment!.deliveredAt!;
    final currentDate = DateTime.now();
    final difference = currentDate.difference(deliveryDate).inDays;

    return difference <= 14;
  }
}
