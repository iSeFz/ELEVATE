import 'package:flutter/material.dart';

class AddressFormField extends StatelessWidget {
  final TextEditingController? controller;
  final String label;
  final double screenWidth;

  const AddressFormField({
    super.key,
    this.controller,
    required this.label,
    required this.screenWidth,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10.0)),
        contentPadding: EdgeInsets.symmetric(
          horizontal: screenWidth * 0.04,
          vertical: MediaQuery.of(context).size.height * 0.015,
        ),
      ),
      style: TextStyle(fontSize: screenWidth * 0.04),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter $label';
        }
        return null;
      },
      autovalidateMode: AutovalidateMode.onUnfocus,
    );
  }
}
