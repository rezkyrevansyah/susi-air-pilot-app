import { readSeed, SeedService } from './seed.service.js';
import {
  validateDocumentData,
  validateFlightData,
  validateScheduleData,
} from './validate-seed.js';

describe('seed loading', () => {
  const seed = new SeedService();

  it('loads and freezes the provided data', () => {
    expect(seed.flights.flightHours).toHaveLength(521);
    expect(seed.documents.documents).toHaveLength(5);
    expect(seed.schedules.schedules).toHaveLength(54);
    expect(Object.isFrozen(seed.flights.flightHours[0])).toBe(true);
  });

  it('reports missing files with their filename', () => {
    expect(() => readSeed('missing-seed.json', validateFlightData)).toThrow(
      'Cannot load missing-seed.json',
    );
  });

  it('rejects invalid flight values and duplicate dates', () => {
    expect(() =>
      validateFlightData({
        ...seed.flights,
        flightHours: [{ date: '2026-02-30', hours: 1 }],
      }),
    ).toThrow('flightHours.date');
    expect(() =>
      validateFlightData({
        ...seed.flights,
        flightHours: [{ date: '2026-05-15', hours: -1 }],
      }),
    ).toThrow('flightHours.hours');
    expect(() =>
      validateFlightData({
        ...seed.flights,
        flightHours: [seed.flights.flightHours[0], seed.flights.flightHours[0]],
      }),
    ).toThrow('unique');
    expect(() =>
      validateFlightData({ ...seed.flights, chartBounds: {} }),
    ).toThrow('chartBounds');
  });

  it('rejects invalid documents and duty counts', () => {
    expect(() =>
      validateDocumentData({
        ...seed.documents,
        documents: [{ id: 'x', label: 'Test', expiryDate: 'soon' }],
      }),
    ).toThrow('expiryDate');
    expect(() =>
      validateScheduleData({
        ...seed.schedules,
        schedules: [{ ...seed.schedules.schedules[0], count_logbooks: 99 }],
      }),
    ).toThrow('count_logbooks');
  });

  it('accepts a source color different from its duty legend', () => {
    expect(() => validateScheduleData(seed.schedules)).not.toThrow();
    expect(
      seed.schedules.schedules.find((row) => row.duty_date === '2026-06-04')
        ?.base_color,
    ).toBe('#FBA577');
  });
});
