// tslint:disable:no-expression-statement
import test from 'ava';
import { loginToGoogleMap } from './gomshal';

test('loginToGoogleMap return json', t => {
  t.is(loginToGoogleMap, JSON.parse('{location: true}'));
});
