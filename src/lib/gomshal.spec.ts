import { expect } from 'chai';

// eslint-disable-next-line sort-imports
// import { BrowserVisibility } from './enums';
import { Gomshal } from './gomshal';
import { GOOGLE_MAPS_URL } from './interfaces';

describe('gomshal', function () {
  let g: Gomshal;

  it('should get default settings', function () {
    g = new Gomshal({});
    expect(g.gomshalSettings.googleMapsUrl).equal(GOOGLE_MAPS_URL);
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
