// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CustomerAdapter extends TypeAdapter<Customer> {
  @override
  final int typeId = 0;

  @override
  Customer read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Customer(
      id: fields[0] as String?,
      email: fields[1] as String?,
      firstName: fields[2] as String?,
      lastName: fields[3] as String?,
      username: fields[4] as String?,
      phoneNumber: fields[8] as String?,
      imageURL: fields[5] as String?,
      loyaltyPoints: fields[6] as int?,
      addresses: (fields[9] as List?)?.cast<UserAddress>(),
    )..token = fields[7] as String?;
  }

  @override
  void write(BinaryWriter writer, Customer obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.email)
      ..writeByte(2)
      ..write(obj.firstName)
      ..writeByte(3)
      ..write(obj.lastName)
      ..writeByte(4)
      ..write(obj.username)
      ..writeByte(8)
      ..write(obj.phoneNumber)
      ..writeByte(5)
      ..write(obj.imageURL)
      ..writeByte(6)
      ..write(obj.loyaltyPoints)
      ..writeByte(7)
      ..write(obj.token)
      ..writeByte(9)
      ..write(obj.addresses);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CustomerAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
