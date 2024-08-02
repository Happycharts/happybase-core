import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/app/utils/supabase/client';
import { NumericFormat } from 'react-number-format';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentLinkData) => Promise<void>;
}

interface PaymentLinkData {
  price: number;
  productName: string;
  freeTrial: string;
}

const supabase = createClient();

const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const form = useForm<PaymentLinkData>();
  const { register, handleSubmit: handleFormSubmit, control } = form;

  const submitForm = async (data: PaymentLinkData) => {
    try {
      const { data: supabaseData, error } = await supabase
        .from('payment_links')
        .insert([
          {
            price: data.price,
            product_name: data.productName,
            free_trial: data.freeTrial,
          },
        ]);

      if (error) {
        throw error;
      }

      console.log('Payment link created successfully:', supabaseData);
    } catch (error) {
      console.error('Error creating payment link:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Payment Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(submitForm)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="h-4 w-6" />
                </div>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<PaymentLinkData, "price"> }) => (
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator={true}
                      prefix="$"
                      decimalScale={2}
                      fixedDecimalScale={true}
                      placeholder="Enter price"
                      onValueChange={(values) => {
                        field.onChange(values.floatValue);
                      }}
                      value={field.value}
                      className="pl-12"
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                type="text"
                id="productName"
                {...register('productName')}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label>Free Trial</Label>
              <Controller
                name="freeTrial"
                control={control}
                render={({ field }: { field: ControllerRenderProps<PaymentLinkData, "freeTrial"> }) => (
                  <RadioGroup {...field}>
                    <RadioGroupItem value="yes">Yes</RadioGroupItem>
                    <RadioGroupItem value="no">No</RadioGroupItem>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Link</Button>
            <Button onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export default PaymentLinkModal;