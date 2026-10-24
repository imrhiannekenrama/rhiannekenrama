import test from 'node:test';
import assert from 'node:assert/strict';
import {slugify,normalizeEntry} from '../lib/validation.ts';
test('slugifies Unicode and punctuation safely',()=>{assert.equal(slugify('  My First Book!  '),'my-first-book');assert.equal(slugify('Éducation & Life'), 'education-life')});
test('normalizes draft content and trims input',()=>{const x=normalizeEntry({title:'  My Journal  ',type:'journal',status:'draft',visibility:'private',body:[{id:'a',type:'paragraph',text:'Hello'}],tags:['life']});assert.equal(x.title,'My Journal');assert.equal(x.status,'draft');assert.equal(x.body[0].text,'Hello')});
test('rejects empty title',()=>assert.throws(()=>normalizeEntry({title:' ',type:'journal'}),/title/i));
test('rejects unknown type',()=>assert.throws(()=>normalizeEntry({title:'Hi',type:'dangerous'}),/type/i));
test('scheduled content must be in the future',()=>assert.throws(()=>normalizeEntry({title:'Hi',type:'journal',status:'scheduled',published_at:'2000-01-01T00:00:00Z'}),/future/i));
