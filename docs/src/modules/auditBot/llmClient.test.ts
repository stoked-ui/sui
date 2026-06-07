import { expect } from 'chai';
import { stripReasoning } from './llmClient';

describe('auditBot llmClient — stripReasoning', () => {
  it('removes a <reasoning>...</reasoning> block and keeps the answer', () => {
    expect(
      stripReasoning('<reasoning>The user wants OK. Comply.</reasoning>OK'),
    ).to.equal('OK');
  });

  it('removes multiline reasoning blocks', () => {
    const text = '<reasoning>\nline one\nline two\n</reasoning>\nHello there!';
    expect(stripReasoning(text)).to.equal('Hello there!');
  });

  it('removes multiple blocks and trims whitespace', () => {
    const text = '<reasoning>a</reasoning> Hi <reasoning>b</reasoning> friend ';
    expect(stripReasoning(text)).to.equal('Hi  friend');
  });

  it('drops an unterminated reasoning block (truncated stream)', () => {
    expect(stripReasoning('Answer first. <reasoning>got cut off')).to.equal('Answer first.');
  });

  it('leaves plain text untouched', () => {
    expect(stripReasoning('Just a normal reply.')).to.equal('Just a normal reply.');
  });

  it('handles empty/nullish input', () => {
    expect(stripReasoning('')).to.equal('');
    expect(stripReasoning(undefined)).to.equal('');
    expect(stripReasoning(null)).to.equal('');
  });
});
