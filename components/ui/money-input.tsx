"use client";
import React from 'react';
import { NumericFormat } from 'react-number-format';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { FlagIcon } from '@heroicons/react/24/solid';

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
};

export default function MoneyInput(props: TextInputProps) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <div className="relative">
              <NumericFormat
                customInput={Input}
                thousandSeparator={true}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale={true}
                placeholder={props.placeholder}
                onValueChange={(values) => {
                  field.onChange(values.floatValue);
                }}
                value={field.value}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FlagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}