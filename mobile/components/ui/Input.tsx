import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      style={{
        borderWidth:1,
        borderColor:'#ccc',
        padding:8,
        marginBottom:12,
        borderRadius:4
      }}
      {...props}
    />
  );
}