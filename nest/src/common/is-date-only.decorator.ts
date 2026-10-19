import { registerDecorator, ValidationOptions } from 'class-validator';
import { isDateOnly } from './date.js';

export function IsDateOnly(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isDateOnly',
      target: target.constructor,
      propertyName: String(propertyKey),
      options,
      validator: {
        validate: isDateOnly,
        defaultMessage: (args) =>
          `${args?.property ?? 'date'} must be a valid date in YYYY-MM-DD format`,
      },
    });
  };
}
