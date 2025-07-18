// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class UserAddressAdapter extends TypeAdapter<UserAddress> {
  @override
  final int typeId = 1;

  @override
  UserAddress read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserAddress(
      id: fields[0] as String?,
      displayedAddress: fields[1] as String?,
      city: fields[2] as String?,
      street: fields[3] as String?,
      building: fields[4] as int?,
      postalCode: fields[5] as int?,
      latitude: fields[6] as double?,
      longitude: fields[7] as double?,
      isDefault: fields[8] as bool?,
    );
  }

  @override
  void write(BinaryWriter writer, UserAddress obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.displayedAddress)
      ..writeByte(2)
      ..write(obj.city)
      ..writeByte(3)
      ..write(obj.street)
      ..writeByte(4)
      ..write(obj.building)
      ..writeByte(5)
      ..write(obj.postalCode)
      ..writeByte(6)
      ..write(obj.latitude)
      ..writeByte(7)
      ..write(obj.longitude)
      ..writeByte(8)
      ..write(obj.isDefault);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserAddressAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
