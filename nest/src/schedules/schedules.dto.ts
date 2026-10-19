import { Matches } from 'class-validator';

export class SchedulesQueryDto {
  @Matches(/^[1-9]\d{3}$/, {
    message: 'year must be a four-digit year from 1000 to 9999',
  })
  year!: string;

  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'month must be between 01 and 12' })
  month!: string;
}
