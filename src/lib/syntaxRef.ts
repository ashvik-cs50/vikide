import type { SyntaxGroup } from '../types';

export const SYNTAX_REF: SyntaxGroup[] = [
  {
    group: 'Input',
    items: [
      {
        cmd: 'get varName Question text?',
        desc: 'Ask user for text.',
        insert: 'get name What is your name?',
      },
      {
        cmd: 'getIn varName Question text?',
        desc: 'Ask user for a number.',
        insert: 'getIn age How old are you?',
      },
    ],
  },
  {
    group: 'Output',
    items: [
      {
        cmd: 'say message text',
        desc: 'Print a line. Use vari,varName to show a variable.',
        insert: 'say Hello vari,name!',
      },
    ],
  },
  {
    group: 'Variables',
    items: [
      {
        cmd: 'set varName = value',
        desc: 'Create or update a variable.',
        insert: 'set score = 0',
      },
      {
        cmd: 'vari,varName',
        desc: 'Use a variable inside say.',
        insert: 'say Your score is vari,score',
      },
    ],
  },
  {
    group: 'Conditions',
    items: [
      {
        cmd: 'i varName == value\n  ...\nenif',
        desc: 'If block. Supports ==, !=, >=, <=, >, <.',
        insert: 'i score >= 10\n  say You win!\nenif',
      },
    ],
  },
  {
    group: 'Arrays',
    items: [
      {
        cmd: 'ar arrayName = a,b,c',
        desc: 'Define an array.',
        insert: 'ar colors = red,green,blue',
      },
    ],
  },
  {
    group: 'Math',
    items: [
      {
        cmd: 'calc result = a OP b',
        desc: 'Math: a=add s=sub m=mul d=div',
        insert: 'calc total = score a 10',
      },
    ],
  },
  {
    group: 'Loops',
    items: [
      {
        cmd: 'rep N\n  ...\nenrep',
        desc: 'Repeat N times.',
        insert: 'rep 3\n  say Hello!\nenrep',
      },
      {
        cmd: 'whi var OP val\n  ...\nenwhi',
        desc: 'While loop.',
        insert: 'whi count < 5\n  say vari,count\n  calc count = count a 1\nenwhi',
      },
    ],
  },
  {
    group: 'Functions',
    items: [
      {
        cmd: 'fun funcName\n  ...\nendf',
        desc: 'Define a function.',
        insert: 'fun greet\n  say Hello vari,name!\nendf',
      },
      {
        cmd: 'call funcName',
        desc: 'Call a function.',
        insert: 'call greet',
      },
    ],
  },
  {
    group: 'String Tools',
    items: [
      {
        cmd: 'joi,var1 var2',
        desc: 'Join two variables.',
        insert: 'joi,firstName lastName',
      },
      {
        cmd: 'upp varName',
        desc: 'Uppercase.',
        insert: 'upp name',
      },
      {
        cmd: 'low varName',
        desc: 'Lowercase.',
        insert: 'low name',
      },
      {
        cmd: 'len varName resultVar',
        desc: 'Get length.',
        insert: 'len name nameLength',
      },
    ],
  },
  {
    group: 'Random',
    items: [
      {
        cmd: 'rnd varName min max',
        desc: 'Random int between min and max.',
        insert: 'rnd dice 1 6',
      },
    ],
  },
  {
    group: 'Comments',
    items: [
      {
        cmd: '// comment text',
        desc: 'A comment \u2014 not executed.',
        insert: '// This is a comment',
      },
    ],
  },
];
