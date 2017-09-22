import parser, { LineType } from './parser';
import { expect } from 'chai';
import 'mocha';

describe('Parser', () => {
  it("can receive a string and count the number of lines", () => {
    const script = "Hello!\nHow is it going?";
    const result = parser.readFile(script).then((parsedFile) => {
      expect(parsedFile.metadata.lineCount).to.equal(2);
    });
  });

  it("can receive a string and parse simple lines", () => {
    const script = "Hello!\nHow is it going?";
    const result = parser.readFile(script).then((parsedFile) => {
      const hello = parsedFile.lines[0];
      expect(hello.type).to.equal(LineType.Dialog);
    });
  });

  it("can receive a string and parse a directive", () => {
    const script = "[[scene = \"foo\"]]";
    const result = parser.readFile(script).then((parsedFile) => {
      const hello = parsedFile.lines[0];
      expect(hello.type).to.equal(LineType.Directive);
    });
  });

  it("can receive a string and parse a global directive", () => {
    const script = "[[[name = \"foo\"]]]";
    const result = parser.readFile(script).then((parsedFile) => {
      const hello = parsedFile.lines[0];
      expect(hello.type).to.equal(LineType.Global);
    });
  });

  it("can receive a big script with different types", () => {
    const script = "[[[\nname = \"foo\"\n]]]\n[[\nscene = \"foo\"\n]]\ndialog";

    const result = parser.readFile(script).then((parsedFile) => {
      const openGlobal = parsedFile.lines[0];
      expect(openGlobal.type).to.equal(LineType.Global);

      const inGlobal = parsedFile.lines[1];
      expect(inGlobal.type).to.equal(LineType.InDirective);

      const closeGlobal = parsedFile.lines[2];
      expect(closeGlobal.directive.name).to.equal('foo');
      expect(closeGlobal.type).to.equal(LineType.Global);

      const openDirective = parsedFile.lines[3];
      expect(openDirective.type).to.equal(LineType.Directive);

      const inDirective = parsedFile.lines[4];
      expect(inDirective.type).to.equal(LineType.InDirective);

      const closeDirective = parsedFile.lines[5];
      expect(closeDirective.type).to.equal(LineType.Directive);

      const dialog = parsedFile.lines[6];
      expect(dialog.type).to.equal(LineType.Dialog);
    });
  });
});
