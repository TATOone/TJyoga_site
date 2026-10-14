import { describe, expect, it } from 'vitest';
import { envBoolean } from '../src/config/env.js';

describe('envBoolean', () => {
  it('parses dotenv string false as false', () => {
    expect(envBoolean.parse('false')).toBe(false);
    expect(envBoolean.parse('FALSE')).toBe(false);
    expect(envBoolean.parse('0')).toBe(false);
    expect(envBoolean.parse('off')).toBe(false);
  });

  it('parses dotenv string true as true', () => {
    expect(envBoolean.parse('true')).toBe(true);
    expect(envBoolean.parse('1')).toBe(true);
    expect(envBoolean.parse('yes')).toBe(true);
  });

  it('keeps real booleans', () => {
    expect(envBoolean.parse(false)).toBe(false);
    expect(envBoolean.parse(true)).toBe(true);
  });
});
