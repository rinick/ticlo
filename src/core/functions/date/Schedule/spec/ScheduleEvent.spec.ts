import {expect} from 'vitest';
import {ScheduleEvent} from '../ScheduleEvent';
import {DateTime} from 'luxon';

describe('ScheduleEvent', function () {
  it('parse', function () {
    let event = ScheduleEvent.fromProperty({repeat: 'daily', start: [1, 23], duration: 60});
    expect(event.repeat).toBe('daily');
    expect(event.start).toEqual([1, 23]);
    expect(event.durationMs).toEqual(3599_999);

    event = ScheduleEvent.fromProperty({repeat: 'weekly', start: [2, 34], days: [1, 3, 5], duration: 60});
    expect(event.days).toEqual([1, 3, 5]);

    event = ScheduleEvent.fromProperty({repeat: 'monthly', start: [3, 45], days: [1, 11, 21, 31], duration: 60});
    expect(event.days).toEqual([1, 11, 21, 31]);
  });

  it('parse invalid', function () {
    let event = ScheduleEvent.fromProperty({repeat: 'daily', start: [99, 23], duration: 60});
    expect(event).toBeNull();

    event = ScheduleEvent.fromProperty({repeat: 'weekly', start: [2, 34], days: [0, 1], duration: 60});
    expect(event).toBeNull();

    event = ScheduleEvent.fromProperty({repeat: 'monthly', start: [3, 45], days: [2, 12, 22, 32], duration: 60});
    expect(event).toBeNull();
  });

  it('next event', function () {
    const event = ScheduleEvent.fromProperty({repeat: 'daily', start: [12, 20], duration: 60});
    const occur1 = event.getOccur(new Date('2024-01-01').getTime());
    expect(occur1.start).toBe(new Date('2024-01-01T12:20').getTime());

    const occur2 = event.getOccur(new Date('2024-01-01T11:00').getTime());
    expect(occur2).toBe(occur1); // not changed

    const occur3 = event.getOccur(new Date('2024-01-01T12:30').getTime());
    expect(occur3).toBe(occur1); // not changed

    // next
    const occur4 = event.getOccur(new Date('2024-01-01T13:20').getTime());
    expect(occur4.start).toBe(new Date('2024-01-02T12:20').getTime());
  });

  it('duration overflow', function () {
    const event = ScheduleEvent.fromProperty({repeat: 'hourly', start: [0, 0], duration: 120});
    const occur1 = event.getOccur(DateTime.fromISO('2024-01-01').valueOf());
    expect(occur1.start).toBe(DateTime.fromISO('2024-01-01T00:00').valueOf());

    // when duration pass the next start, it should end before the next start
    expect(occur1.end - occur1.start).toBe(3600_000 - 1);

    const occur2 = event.getOccur(new Date('2024-01-01T01:00').getTime());
    expect(occur2.start).toBe(DateTime.fromISO('2024-01-01T01:00').valueOf());
  });

  it('after', function () {
    const event = ScheduleEvent.fromProperty({
      repeat: 'daily',
      start: [12, 10],
      duration: 90,
      after: DateTime.fromISO('2024-01-05'),
    });
    const occur1 = event.getOccur(DateTime.fromISO('2024-01-01').valueOf());
    expect(occur1.start).toBe(DateTime.fromISO('2024-01-05T12:10').valueOf());

    const occur2 = event.getOccur(DateTime.fromISO('2024-01-07').valueOf());
    expect(occur2.start).toBe(DateTime.fromISO('2024-01-07T12:10').valueOf());
  });

  it('before', function () {
    const event = ScheduleEvent.fromProperty({
      repeat: 'daily',
      start: [12, 10],
      duration: 90,
      before: DateTime.fromISO('2024-01-05'),
    });
    const occur1 = event.getOccur(DateTime.fromISO('2024-01-01').valueOf());
    expect(occur1.start).toBe(DateTime.fromISO('2024-01-01T12:10').valueOf());

    const occur2 = event.getOccur(DateTime.fromISO('2024-01-07').valueOf());
    expect(occur2.start).toBe(Infinity);
  });
});
