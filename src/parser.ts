import * as _ from 'lodash';
import { parse } from 'toml';

interface FileWalker {
  parsedDirective: string[];
  parsingDirective: boolean
}

const fileWalker: FileWalker = {
  parsedDirective: [],
  parsingDirective: false
};

export enum LineType {
  Directive,
  InDirective,
  Dialog,
  Global
}

interface Line {
  directive?: any;
  text: string;
  type: LineType;
}

interface Metadata {
  lineCount: number
}

interface ParsedFile {
  metadata: Metadata;
  lines: Array<Line>;
}

const startingDirective = (line: string): boolean => {
  return _.startsWith(line, '[[') || _.startsWith(line, '[[[');
}

const endingDirective = (line: string): boolean => {
  return _.startsWith(line, ']]') || _.startsWith(line, ']]]');
}

const isGlobal = (line: string): boolean => {
  return _.includes(line, '[[[') || _.includes(line, ']]]')
}

const isDirective = (line: string): boolean => {
  return _.includes(line, '[[') || _.includes(line, ']]')
}

const readLine = (line: string, index: number, walker: FileWalker): [Line, FileWalker] => {
  let newWalker = Object.assign({}, walker);
  let parsedLine: Line = { text: line, type: LineType.Dialog }

  if (startingDirective(line)) {
    newWalker.parsingDirective = true
  }

  if (isGlobal(line)) {
    parsedLine = { text: line, type: LineType.Global }
  } else if (isDirective(line)) {
    parsedLine = { text: line, type: LineType.Directive }
  }

  if (endingDirective(line)) {
    newWalker.parsingDirective = false;
    parsedLine.directive = parse(newWalker.parsedDirective.join('\n'))
    newWalker.parsedDirective = [];
  } else {
    if (walker.parsingDirective) {
      newWalker.parsedDirective = newWalker.parsedDirective.concat(line)
      parsedLine = { text: line, type: LineType.InDirective }
    }
  }

  return [parsedLine, newWalker]
}

const readFile = (data: string): Promise<ParsedFile> => {
  return new Promise((resolve, reject) => {
    const lines: Array<string> = data.split("\n");
    let inUseWalker = fileWalker;

    const parsedLines: Array<Line> = lines.map((line, index) => {
      const [parsedLine, newWalker] = readLine(line, index, inUseWalker)
      inUseWalker = newWalker
      return parsedLine;
    });

    return resolve({
      metadata: {
        lineCount: lines.length,
        walker: inUseWalker
      },
      lines: parsedLines,
    });
  });
}

export default {
  readFile
}
