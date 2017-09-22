import telegraph, { version } from './telegraph';
import { expect } from 'chai';
import 'mocha';

describe('Telegraph', () => {
  it("should be able to call the version", () => {
    expect(telegraph.version).to.equal("0.0.1");
  });

  it("should be able to import and call the version", () => {
    expect(version).to.equal("0.0.1");
  });
});
