import 'package:flutter/material.dart';

class CustomTextFormField extends StatelessWidget {
  final String? hint;
  final String? initialValue;
  final bool enabled;
  final bool isPassword;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final IconButton? suffixIcon;
  final String label;
  final void Function(String?)? onSaved;
  final void Function(String?)? onChanged;
  final String? Function(String?)? validationFunc;

  const CustomTextFormField({
    super.key,
    required this.label,
    this.validationFunc,
    this.onSaved,
    this.onChanged,
    this.isPassword = false,
    this.controller,
    this.keyboardType,
    this.enabled = true,
    this.suffixIcon,
    this.hint,
    this.initialValue,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: isPassword,
      obscuringCharacter: '*',
      initialValue: initialValue,
      decoration: InputDecoration(
        label: Text(
          label,
          style: TextStyle(
            fontSize: 16,
            color: Colors.black,
            fontWeight: FontWeight.w400,
          ),
        ),
        floatingLabelAlignment: FloatingLabelAlignment.start,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
        hintText: hint,
        hintTextDirection: TextDirection.ltr,
        hintStyle: TextStyle(
          fontFamily: 'Arial',
          fontSize: 16,
          color: Colors.grey,
          fontWeight: FontWeight.w400,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey, width: 1),
        ),
        suffixIcon: suffixIcon,
      ),
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: validationFunc,
      enabled: enabled,
      onChanged: onChanged,
      onSaved: onSaved,
    );
  }
}
