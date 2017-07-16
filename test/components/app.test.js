import { h, render } from 'preact';
import { route } from 'preact-router';
import { expect } from 'chai';

import App from '../../src/components/app';

describe('App', () => {
	let scratch;

	beforeAll( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	afterAll( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

});
