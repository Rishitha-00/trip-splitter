import { parseExpenses } from './parse';
import { sampleExpenses } from '../data/sample';
describe('parseExpenses', () => {
  it('accepts saved data that is valid', () => {
    expect(parseExpenses(JSON.parse(JSON.stringify(sampleExpenses)))).toEqual(sampleExpenses);
  });
  it('rejects broken data', () => {
    expect(parseExpenses('nope')).toBeNull();
    expect(parseExpenses([{ id: 1 }])).toBeNull();
  });
});
