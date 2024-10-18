import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validateAddress } from 'src/utils/validations';

@ValidatorConstraint({ async: false })
export class IsAmountValidConstraint implements ValidatorConstraintInterface {
  validate(amount: any) {
    return typeof amount === 'string' && Number(amount) > 0;
  }

  defaultMessage() {
    return 'The amount must be greater than 0';
  }
}

export function IsAmountValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAmountValidConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsAddressValidConstraint implements ValidatorConstraintInterface {
  validate(address: any) {
    return typeof address === 'string' && validateAddress(address);
  }

  defaultMessage() {
    return 'The address provided is not valid';
  }
}

export function IsAddressValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAddressValidConstraint,
    });
  };
}