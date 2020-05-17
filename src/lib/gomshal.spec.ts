import { Gomshal, Step } from './gomshal';

describe('gomshal', function () {
  let g: Gomshal;
  before(function () {
    g = new Gomshal();
  });

  it('should open puppeteer', function () {
    g.initialize({ nextStep: Step.OpenBrowser }).then(
      () => g.close()
    );
  });
});
