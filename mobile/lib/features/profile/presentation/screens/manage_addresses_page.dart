import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/profile_cubit.dart';
import '../cubits/profile_state.dart';
import '../widgets/address_form_field.dart';

class ManageAddressesPage extends StatelessWidget {
  const ManageAddressesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final profileCubit = context.read<ProfileCubit>();

    return BlocConsumer<ProfileCubit, ProfileState>(
      bloc: profileCubit,
      listener: (context, state) {
        if (state is AddressSaved) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Address saved successfully!')),
          );
        } else if (state is AddressDeleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Address deleted successfully!')),
          );
        } else if (state is DefaultAddressUpdated) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Default address updated successfully!')),
          );
        } else if (state is ProfileError) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        final addresses = profileCubit.addresses;
        final expandedAddressId = profileCubit.expandedAddressId;
        return Scaffold(
          appBar: AppBar(
            title: const Text('Manage Addresses'),
            centerTitle: true,
          ),
          floatingActionButton:
              addresses.isEmpty
                  ? null
                  : FloatingActionButton(
                    onPressed: profileCubit.addNewAddress,
                    tooltip: 'Add New Address',
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.add),
                  ),
          body:
              state is AddressLoading
                  ? Center(
                    child: CircularProgressIndicator(
                      color: Theme.of(context).primaryColor,
                    ),
                  )
                  : addresses.isEmpty
                  ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Location off icon to indicate the absence of addresses
                        Icon(
                          Icons.location_off_outlined,
                          size: screenWidth * 0.2,
                          color: Colors.grey,
                        ),
                        SizedBox(height: screenHeight * 0.02),
                        Text(
                          'No addresses found.',
                          style: TextStyle(
                            fontSize: screenWidth * 0.045,
                            color: Colors.grey,
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.01),
                        Text(
                          'Add a new address to get started.',
                          style: TextStyle(
                            fontSize: screenWidth * 0.04,
                            color: Colors.grey[600],
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.03),
                        ElevatedButton.icon(
                          icon: Icon(
                            Icons.add_location_alt_outlined,
                            size: screenWidth * 0.07,
                          ),
                          label: Text(
                            'Add New Address',
                            style: TextStyle(fontSize: screenWidth * 0.045),
                          ),
                          onPressed: profileCubit.addNewAddress,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(
                              horizontal: screenWidth * 0.08,
                              vertical: screenHeight * 0.016,
                            ),
                            textStyle: TextStyle(
                              fontSize: screenWidth * 0.045,
                              fontWeight: FontWeight.bold,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                  : ListView.builder(
                    padding: EdgeInsets.all(screenWidth * 0.04),
                    itemCount: addresses.length,
                    itemBuilder: (context, index) {
                      final address = addresses[index];
                      final isExpanded =
                          state is AddressExpanded &&
                          expandedAddressId == address.id;

                      return Card(
                        elevation: 4.0,
                        margin: EdgeInsets.symmetric(
                          vertical: screenHeight * 0.01,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: InkWell(
                          onTap:
                              () => profileCubit.toggleExpandAddress(
                                address.id ?? '',
                              ),
                          child: Padding(
                            padding: EdgeInsets.all(screenWidth * 0.04),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        address.displayedAddress ?? '',
                                        style: TextStyle(
                                          fontSize: screenWidth * 0.04,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (address.isDefault ?? false)
                                      Icon(
                                        Icons.star,
                                        color: Theme.of(context).primaryColor,
                                        size: screenWidth * 0.06,
                                      ),
                                    Icon(
                                      isExpanded
                                          ? Icons.expand_less
                                          : Icons.expand_more,
                                    ),
                                  ],
                                ),
                                if (isExpanded)
                                  Form(
                                    key: profileCubit.addressFormKey,
                                    child: Padding(
                                      padding: EdgeInsets.only(
                                        top: screenHeight * 0.02,
                                      ),
                                      child: Column(
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: AddressFormField(
                                                  label: 'City',
                                                  controller:
                                                      profileCubit
                                                          .cityController,
                                                  screenWidth: screenWidth,
                                                ),
                                              ),
                                              SizedBox(
                                                width: screenWidth * 0.03,
                                              ),
                                              Expanded(
                                                child: AddressFormField(
                                                  label: 'Postal Code',
                                                  controller:
                                                      profileCubit
                                                          .postalCodeController,
                                                  screenWidth: screenWidth,
                                                ),
                                              ),
                                            ],
                                          ),
                                          SizedBox(
                                            height: screenHeight * 0.015,
                                          ),
                                          Row(
                                            children: [
                                              Expanded(
                                                child: AddressFormField(
                                                  label: 'Street',
                                                  controller:
                                                      profileCubit
                                                          .streetController,
                                                  screenWidth: screenWidth,
                                                ),
                                              ),
                                              SizedBox(
                                                width: screenWidth * 0.03,
                                              ),
                                              Expanded(
                                                child: AddressFormField(
                                                  label: 'Building',
                                                  controller:
                                                      profileCubit
                                                          .buildingController,
                                                  screenWidth: screenWidth,
                                                ),
                                              ),
                                            ],
                                          ),
                                          SizedBox(height: screenHeight * 0.02),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              TextButton.icon(
                                                icon: Icon(
                                                  (address.isDefault ?? false)
                                                      ? Icons.check_box
                                                      : Icons
                                                          .check_box_outline_blank,
                                                  color:
                                                      Theme.of(
                                                        context,
                                                      ).primaryColor,
                                                  size: screenWidth * 0.065,
                                                ),
                                                label: Text(
                                                  'Set as Default',
                                                  style: TextStyle(
                                                    color:
                                                        Theme.of(
                                                          context,
                                                        ).primaryColor,
                                                    fontSize:
                                                        screenWidth * 0.04,
                                                  ),
                                                ),
                                                onPressed:
                                                    (address.isDefault ?? false)
                                                        ? null
                                                        : () => profileCubit
                                                            .setDefaultAddress(
                                                              address.id ?? '',
                                                            ),
                                              ),
                                              Row(
                                                children: [
                                                  IconButton(
                                                    icon: Icon(
                                                      Icons.delete_outline,
                                                      color:
                                                          Theme.of(
                                                            context,
                                                          ).colorScheme.error,
                                                      size: screenWidth * 0.06,
                                                    ),
                                                    onPressed:
                                                        () => profileCubit
                                                            .deleteAddress(
                                                              address.id ?? '',
                                                            ),
                                                    tooltip: 'Delete Address',
                                                  ),
                                                  SizedBox(
                                                    width: screenWidth * 0.02,
                                                  ),
                                                  ElevatedButton(
                                                    onPressed: () async {
                                                      await profileCubit
                                                          .saveAddress(
                                                            address.id ?? '',
                                                          );
                                                    },
                                                    style: ElevatedButton.styleFrom(
                                                      backgroundColor:
                                                          Theme.of(
                                                            context,
                                                          ).primaryColor,
                                                      foregroundColor:
                                                          Colors.white,
                                                      padding:
                                                          EdgeInsets.symmetric(
                                                            horizontal:
                                                                screenWidth *
                                                                0.04,
                                                            vertical:
                                                                screenHeight *
                                                                0.01,
                                                          ),
                                                    ),
                                                    child: Text('Save'),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
        );
      },
    );
  }
}
