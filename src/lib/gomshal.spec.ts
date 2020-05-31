import { expect } from 'chai';

import { defaultConfiguration } from './interfaces';
import { Gomshal } from './gomshal';

describe('gomshal', function () {
  let g: Gomshal;

  this.beforeAll(() => {
    g = new Gomshal();
  });

  it('should get default settings', () => {
    expect(g.configuration).deep.equal(defaultConfiguration);
  });
});
