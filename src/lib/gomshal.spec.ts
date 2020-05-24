import { expect } from 'chai';

import { defaultSettings } from './interfaces';
import { Gomshal } from './gomshal';

describe('gomshal', function () {
  let g: Gomshal;

  it('should get default settings', function () {
    g = new Gomshal({});
    expect(g.gomshalSettings).deep.equal(defaultSettings);
  });

  // before(function () {
  //   g = new Gomshal({
  //     browserVisibility: BrowserVisibility.Hidden,
  //   });
  // });

  // it('should open puppeteer', function () {
  //   g.getSharedLocation({ }).then(
  //     () => g.close()
  //   );
  // });
});
