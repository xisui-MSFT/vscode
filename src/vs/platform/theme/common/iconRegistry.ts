/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as platform from 'vs/platform/registry/common/platform';
import { IJSONSchema, IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { Event, Emitter } from 'vs/base/common/event';
import { localize } from 'vs/nls';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { RunOnceScheduler } from 'vs/base/common/async';

//  ------ API types


// color registry
export const Extensions = {
	IconContribution: 'base.contributions.icons'
};

export type IconDefaults = ThemeIcon | IconDefinition;

export interface IconDefinition {
	fontId?: string;
	character: string;
}

export interface IconContribution {
	id: string;
	description: string;
	deprecationMessage?: string;
	defaults: IconDefaults;
}

export interface IIconRegistry {

	readonly onDidChangeSchema: Event<void>;

	/**
	 * Register a icon to the registry.
	 * @param id The icon id
	 * @param defaults The default values
	 * @description the description
	 */
	registerIcon(id: string, defaults: IconDefaults, description: string): ThemeIcon;

	/**
	 * Register a icon to the registry.
	 */
	deregisterIcon(id: string): void;

	/**
	 * Get all icon contributions
	 */
	getIcons(): IconContribution[];

	/**
	 * JSON schema for an object to assign icon values to one of the color contributions.
	 */
	getIconSchema(): IJSONSchema;

	/**
	 * JSON schema to for a reference to a icon contribution.
	 */
	getIconReferenceSchema(): IJSONSchema;

}

class IconRegistry implements IIconRegistry {

	private readonly _onDidChangeSchema = new Emitter<void>();
	readonly onDidChangeSchema: Event<void> = this._onDidChangeSchema.event;

	private iconsById: { [key: string]: IconContribution };
	private iconSchema: IJSONSchema & { properties: IJSONSchemaMap } = {
		definitions: {
			icons: {
				type: 'object',
				properties: {
					fontId: { type: 'string', description: localize('iconDefintion.fontId', 'The id of the font to use. If not set, the font that is defined first is used.') },
					fontCharacter: { type: 'string', description: localize('iconDefintion.fontCharacter', 'The font character associated with the icon definition.') }
				},
				additionalProperties: false,
				defaultSnippets: [{ body: { fontCharacter: '\\\\e030' } }]
			}
		},
		type: 'object',
		properties: {}
	};
	private iconReferenceSchema: IJSONSchema & { enum: string[], enumDescriptions: string[] } = { type: 'string', enum: [], enumDescriptions: [] };

	constructor() {
		this.iconsById = {};
	}

	public registerIcon(id: string, defaults: IconDefaults, description?: string, deprecationMessage?: string): ThemeIcon {
		if (!description) {
			description = localize('icon.defaultDescription', 'Icon with identifier {0}', id);
		}
		let iconContribution: IconContribution = { id, description, defaults, deprecationMessage };
		this.iconsById[id] = iconContribution;
		let propertySchema: IJSONSchema = { $ref: '#/definitions/icons' };
		if (deprecationMessage) {
			propertySchema.deprecationMessage = deprecationMessage;
		}
		propertySchema.markdownDescription = `${description}: $(${id})`;
		this.iconSchema.properties[id] = propertySchema;
		this.iconReferenceSchema.enum.push(id);
		this.iconReferenceSchema.enumDescriptions.push(description);

		this._onDidChangeSchema.fire();
		return { id };
	}


	public deregisterIcon(id: string): void {
		delete this.iconsById[id];
		delete this.iconSchema.properties[id];
		const index = this.iconReferenceSchema.enum.indexOf(id);
		if (index !== -1) {
			this.iconReferenceSchema.enum.splice(index, 1);
			this.iconReferenceSchema.enumDescriptions.splice(index, 1);
		}
		this._onDidChangeSchema.fire();
	}

	public getIcons(): IconContribution[] {
		return Object.keys(this.iconsById).map(id => this.iconsById[id]);
	}

	public getIconSchema(): IJSONSchema {
		return this.iconSchema;
	}

	public getIconReferenceSchema(): IJSONSchema {
		return this.iconReferenceSchema;
	}

	public toString() {
		let sorter = (a: string, b: string) => {
			let cat1 = a.indexOf('.') === -1 ? 0 : 1;
			let cat2 = b.indexOf('.') === -1 ? 0 : 1;
			if (cat1 !== cat2) {
				return cat1 - cat2;
			}
			return a.localeCompare(b);
		};

		return Object.keys(this.iconsById).sort(sorter).map(k => `- \`${k}\`: ${this.iconsById[k].description}`).join('\n');
	}

}

const iconRegistry = new IconRegistry();
platform.Registry.add(Extensions.IconContribution, iconRegistry);

export function registerIcon(id: string, defaults: IconDefaults, description?: string, deprecationMessage?: string): ThemeIcon {
	return iconRegistry.registerIcon(id, defaults, description, deprecationMessage);
}

export function getIconRegistry(): IIconRegistry {
	return iconRegistry;
}

registerIcon('add', { character: '\ea60' });
registerIcon('plus', { character: '\ea60' });
registerIcon('gist-new', { character: '\ea60' });
registerIcon('repo-create', { character: '\ea60' });
registerIcon('lightbulb', { character: '\ea61' });
registerIcon('light-bulb', { character: '\ea61' });
registerIcon('repo', { character: '\ea62' });
registerIcon('repo-delete', { character: '\ea62' });
registerIcon('gist-fork', { character: '\ea63' });
registerIcon('repo-forked', { character: '\ea63' });
registerIcon('git-pull-request', { character: '\ea64' });
registerIcon('git-pull-request-abandoned', { character: '\ea64' });
registerIcon('record-keys', { character: '\ea65' });
registerIcon('keyboard', { character: '\ea65' });
registerIcon('tag', { character: '\ea66' });
registerIcon('tag-add', { character: '\ea66' });
registerIcon('tag-remove', { character: '\ea66' });
registerIcon('person', { character: '\ea67' });
registerIcon('person-add', { character: '\ea67' });
registerIcon('person-follow', { character: '\ea67' });
registerIcon('person-outline', { character: '\ea67' });
registerIcon('person-filled', { character: '\ea67' });
registerIcon('git-branch', { character: '\ea68' });
registerIcon('git-branch-create', { character: '\ea68' });
registerIcon('git-branch-delete', { character: '\ea68' });
registerIcon('source-control', { character: '\ea68' });
registerIcon('mirror', { character: '\ea69' });
registerIcon('mirror-public', { character: '\ea69' });
registerIcon('star', { character: '\ea6a' });
registerIcon('star-add', { character: '\ea6a' });
registerIcon('star-delete', { character: '\ea6a' });
registerIcon('star-empty', { character: '\ea6a' });
registerIcon('comment', { character: '\ea6b' });
registerIcon('comment-add', { character: '\ea6b' });
registerIcon('alert', { character: '\ea6c' });
registerIcon('warning', { character: '\ea6c' });
registerIcon('search', { character: '\ea6d' });
registerIcon('search-save', { character: '\ea6d' });
registerIcon('log-out', { character: '\ea6e' });
registerIcon('sign-out', { character: '\ea6e' });
registerIcon('log-in', { character: '\ea6f' });
registerIcon('sign-in', { character: '\ea6f' });
registerIcon('eye', { character: '\ea70' });
registerIcon('eye-unwatch', { character: '\ea70' });
registerIcon('eye-watch', { character: '\ea70' });
registerIcon('circle-filled', { character: '\ea71' });
registerIcon('primitive-dot', { character: '\ea71' });
registerIcon('close-dirty', { character: '\ea71' });
registerIcon('debug-breakpoint', { character: '\ea71' });
registerIcon('debug-breakpoint-disabled', { character: '\ea71' });
registerIcon('debug-hint', { character: '\ea71' });
registerIcon('primitive-square', { character: '\ea72' });
registerIcon('edit', { character: '\ea73' });
registerIcon('pencil', { character: '\ea73' });
registerIcon('info', { character: '\ea74' });
registerIcon('issue-opened', { character: '\ea74' });
registerIcon('gist-private', { character: '\ea75' });
registerIcon('git-fork-private', { character: '\ea75' });
registerIcon('lock', { character: '\ea75' });
registerIcon('mirror-private', { character: '\ea75' });
registerIcon('close', { character: '\ea76' });
registerIcon('remove-close', { character: '\ea76' });
registerIcon('x', { character: '\ea76' });
registerIcon('repo-sync', { character: '\ea77' });
registerIcon('sync', { character: '\ea77' });
registerIcon('clone', { character: '\ea78' });
registerIcon('desktop-download', { character: '\ea78' });
registerIcon('beaker', { character: '\ea79' });
registerIcon('microscope', { character: '\ea79' });
registerIcon('vm', { character: '\ea7a' });
registerIcon('device-desktop', { character: '\ea7a' });
registerIcon('file', { character: '\ea7b' });
registerIcon('file-text', { character: '\ea7b' });
const more = registerIcon('more', { character: '\ea7c' });
registerIcon('ellipsis', { character: '\ea7c' });
registerIcon('kebab-horizontal', { character: '\ea7c' });
registerIcon('mail-reply', { character: '\ea7d' });
registerIcon('reply', { character: '\ea7d' });
registerIcon('organization', { character: '\ea7e' });
registerIcon('organization-filled', { character: '\ea7e' });
registerIcon('organization-outline', { character: '\ea7e' });
registerIcon('new-file', { character: '\ea7f' });
registerIcon('file-add', { character: '\ea7f' });
registerIcon('new-folder', { character: '\ea80' });
registerIcon('file-directory-create', { character: '\ea80' });
registerIcon('trash', { character: '\ea81' });
registerIcon('trashcan', { character: '\ea81' });
registerIcon('history', { character: '\ea82' });
registerIcon('clock', { character: '\ea82' });
registerIcon('folder', { character: '\ea83' });
registerIcon('file-directory', { character: '\ea83' });
registerIcon('symbol-folder', { character: '\ea83' });
registerIcon('logo-github', { character: '\ea84' });
registerIcon('mark-github', { character: '\ea84' });
registerIcon('github', { character: '\ea84' });
registerIcon('terminal', { character: '\ea85' });
registerIcon('console', { character: '\ea85' });
registerIcon('repl', { character: '\ea85' });
registerIcon('zap', { character: '\ea86' });
registerIcon('symbol-event', { character: '\ea86' });
registerIcon('error', { character: '\ea87' });
registerIcon('stop', { character: '\ea87' });
registerIcon('variable', { character: '\ea88' });
registerIcon('symbol-variable', { character: '\ea88' });
registerIcon('array', { character: '\ea8a' });
registerIcon('symbol-array', { character: '\ea8a' });
registerIcon('symbol-module', { character: '\ea8b' });
registerIcon('symbol-package', { character: '\ea8b' });
registerIcon('symbol-namespace', { character: '\ea8b' });
registerIcon('symbol-object', { character: '\ea8b' });
registerIcon('symbol-method', { character: '\ea8c' });
registerIcon('symbol-function', { character: '\ea8c' });
registerIcon('symbol-constructor', { character: '\ea8c' });
registerIcon('symbol-boolean', { character: '\ea8f' });
registerIcon('symbol-null', { character: '\ea8f' });
registerIcon('symbol-numeric', { character: '\ea90' });
registerIcon('symbol-number', { character: '\ea90' });
registerIcon('symbol-structure', { character: '\ea91' });
registerIcon('symbol-struct', { character: '\ea91' });
registerIcon('symbol-parameter', { character: '\ea92' });
registerIcon('symbol-type-parameter', { character: '\ea92' });
registerIcon('symbol-key', { character: '\ea93' });
registerIcon('symbol-text', { character: '\ea93' });
registerIcon('symbol-reference', { character: '\ea94' });
registerIcon('go-to-file', { character: '\ea94' });
registerIcon('symbol-enum', { character: '\ea95' });
registerIcon('symbol-value', { character: '\ea95' });
registerIcon('symbol-ruler', { character: '\ea96' });
registerIcon('symbol-unit', { character: '\ea96' });
registerIcon('activate-breakpoints', { character: '\ea97' });
registerIcon('archive', { character: '\ea98' });
registerIcon('arrow-both', { character: '\ea99' });
registerIcon('arrow-down', { character: '\ea9a' });
registerIcon('arrow-left', { character: '\ea9b' });
registerIcon('arrow-right', { character: '\ea9c' });
registerIcon('arrow-small-down', { character: '\ea9d' });
registerIcon('arrow-small-left', { character: '\ea9e' });
registerIcon('arrow-small-right', { character: '\ea9f' });
registerIcon('arrow-small-up', { character: '\eaa0' });
registerIcon('arrow-up', { character: '\eaa1' });
registerIcon('bell', { character: '\eaa2' });
registerIcon('bold', { character: '\eaa3' });
registerIcon('book', { character: '\eaa4' });
registerIcon('bookmark', { character: '\eaa5' });
registerIcon('debug-breakpoint-conditional-unverified', { character: '\eaa6' });
registerIcon('debug-breakpoint-conditional', { character: '\eaa7' });
registerIcon('debug-breakpoint-conditional-disabled', { character: '\eaa7' });
registerIcon('debug-breakpoint-data-unverified', { character: '\eaa8' });
registerIcon('debug-breakpoint-data', { character: '\eaa9' });
registerIcon('debug-breakpoint-data-disabled', { character: '\eaa9' });
registerIcon('debug-breakpoint-log-unverified', { character: '\eaaa' });
registerIcon('debug-breakpoint-log', { character: '\eaab' });
registerIcon('debug-breakpoint-log-disabled', { character: '\eaab' });
registerIcon('briefcase', { character: '\eaac' });
registerIcon('broadcast', { character: '\eaad' });
registerIcon('browser', { character: '\eaae' });
registerIcon('bug', { character: '\eaaf' });
registerIcon('calendar', { character: '\eab0' });
registerIcon('case-sensitive', { character: '\eab1' });
const check = registerIcon('check', { character: '\eab2' });
registerIcon('checklist', { character: '\eab3' });
registerIcon('chevron-down', { character: '\eab4' });
registerIcon('chevron-left', { character: '\eab5' });
const chevronRight = registerIcon('chevron-right', { character: '\eab6' });
registerIcon('chevron-up', { character: '\eab7' });
const close = registerIcon('chrome-close', { character: '\eab8' });
registerIcon('chrome-maximize', { character: '\eab9' });
registerIcon('chrome-minimize', { character: '\eaba' });
registerIcon('chrome-restore', { character: '\eabb' });
registerIcon('circle-outline', { character: '\eabc' });
registerIcon('debug-breakpoint-unverified', { character: '\eabc' });
registerIcon('circle-slash', { character: '\eabd' });
registerIcon('circuit-board', { character: '\eabe' });
registerIcon('clear-all', { character: '\eabf' });
registerIcon('clippy', { character: '\eac0' });
registerIcon('close-all', { character: '\eac1' });
registerIcon('cloud-download', { character: '\eac2' });
registerIcon('cloud-upload', { character: '\eac3' });
registerIcon('code', { character: '\eac4' });
registerIcon('collapse-all', { character: '\eac5' });
registerIcon('color-mode', { character: '\eac6' });
registerIcon('comment-discussion', { character: '\eac7' });
registerIcon('compare-changes', { character: '\eac8' });
registerIcon('credit-card', { character: '\eac9' });
registerIcon('dash', { character: '\eacc' });
registerIcon('dashboard', { character: '\eacd' });
registerIcon('database', { character: '\eace' });
registerIcon('debug-continue', { character: '\eacf' });
registerIcon('debug-disconnect', { character: '\ead0' });
registerIcon('debug-pause', { character: '\ead1' });
registerIcon('debug-restart', { character: '\ead2' });
registerIcon('debug-start', { character: '\ead3' });
registerIcon('debug-step-into', { character: '\ead4' });
registerIcon('debug-step-out', { character: '\ead5' });
registerIcon('debug-step-over', { character: '\ead6' });
registerIcon('debug-stop', { character: '\ead7' });
registerIcon('debug', { character: '\ead8' });
registerIcon('device-camera-video', { character: '\ead9' });
registerIcon('device-camera', { character: '\eada' });
registerIcon('device-mobile', { character: '\eadb' });
registerIcon('diff-added', { character: '\eadc' });
registerIcon('diff-ignored', { character: '\eadd' });
registerIcon('diff-modified', { character: '\eade' });
registerIcon('diff-removed', { character: '\eadf' });
registerIcon('diff-renamed', { character: '\eae0' });
registerIcon('diff', { character: '\eae1' });
registerIcon('discard', { character: '\eae2' });
registerIcon('editor-layout', { character: '\eae3' });
registerIcon('empty-window', { character: '\eae4' });
registerIcon('exclude', { character: '\eae5' });
registerIcon('extensions', { character: '\eae6' });
registerIcon('eye-closed', { character: '\eae7' });
registerIcon('file-binary', { character: '\eae8' });
registerIcon('file-code', { character: '\eae9' });
registerIcon('file-media', { character: '\eaea' });
registerIcon('file-pdf', { character: '\eaeb' });
registerIcon('file-submodule', { character: '\eaec' });
registerIcon('file-symlink-directory', { character: '\eaed' });
registerIcon('file-symlink-file', { character: '\eaee' });
registerIcon('file-zip', { character: '\eaef' });
registerIcon('files', { character: '\eaf0' });
registerIcon('filter', { character: '\eaf1' });
registerIcon('flame', { character: '\eaf2' });
registerIcon('fold-down', { character: '\eaf3' });
registerIcon('fold-up', { character: '\eaf4' });
registerIcon('fold', { character: '\eaf5' });
registerIcon('folder-active', { character: '\eaf6' });
registerIcon('folder-opened', { character: '\eaf7' });
registerIcon('gear', { character: '\eaf8' });
registerIcon('gift', { character: '\eaf9' });
registerIcon('gist-secret', { character: '\eafa' });
registerIcon('gist', { character: '\eafb' });
registerIcon('git-commit', { character: '\eafc' });
registerIcon('git-compare', { character: '\eafd' });
registerIcon('git-merge', { character: '\eafe' });
registerIcon('github-action', { character: '\eaff' });
registerIcon('github-alt', { character: '\eb00' });
registerIcon('globe', { character: '\eb01' });
registerIcon('grabber', { character: '\eb02' });
registerIcon('graph', { character: '\eb03' });
registerIcon('gripper', { character: '\eb04' });
registerIcon('heart', { character: '\eb05' });
registerIcon('home', { character: '\eb06' });
registerIcon('horizontal-rule', { character: '\eb07' });
registerIcon('hubot', { character: '\eb08' });
registerIcon('inbox', { character: '\eb09' });
registerIcon('issue-closed', { character: '\eb0a' });
registerIcon('issue-reopened', { character: '\eb0b' });
registerIcon('issues', { character: '\eb0c' });
registerIcon('italic', { character: '\eb0d' });
registerIcon('jersey', { character: '\eb0e' });
registerIcon('json', { character: '\eb0f' });
registerIcon('kebab-vertical', { character: '\eb10' });
registerIcon('key', { character: '\eb11' });
registerIcon('law', { character: '\eb12' });
registerIcon('lightbulb-autofix', { character: '\eb13' });
registerIcon('link-external', { character: '\eb14' });
registerIcon('link', { character: '\eb15' });
registerIcon('list-ordered', { character: '\eb16' });
registerIcon('list-unordered', { character: '\eb17' });
registerIcon('live-share', { character: '\eb18' });
registerIcon('loading', { character: '\eb19' });
registerIcon('location', { character: '\eb1a' });
registerIcon('mail-read', { character: '\eb1b' });
registerIcon('mail', { character: '\eb1c' });
registerIcon('markdown', { character: '\eb1d' });
registerIcon('megaphone', { character: '\eb1e' });
registerIcon('mention', { character: '\eb1f' });
registerIcon('milestone', { character: '\eb20' });
registerIcon('mortar-board', { character: '\eb21' });
registerIcon('move', { character: '\eb22' });
registerIcon('multiple-windows', { character: '\eb23' });
registerIcon('mute', { character: '\eb24' });
registerIcon('no-newline', { character: '\eb25' });
registerIcon('note', { character: '\eb26' });
registerIcon('octoface', { character: '\eb27' });
registerIcon('open-preview', { character: '\eb28' });
registerIcon('package', { character: '\eb29' });
registerIcon('paintcan', { character: '\eb2a' });
registerIcon('pin', { character: '\eb2b' });
registerIcon('play', { character: '\eb2c' });
registerIcon('run', { character: '\eb2c' });
registerIcon('plug', { character: '\eb2d' });
registerIcon('preserve-case', { character: '\eb2e' });
registerIcon('preview', { character: '\eb2f' });
registerIcon('project', { character: '\eb30' });
registerIcon('pulse', { character: '\eb31' });
registerIcon('question', { character: '\eb32' });
registerIcon('quote', { character: '\eb33' });
registerIcon('radio-tower', { character: '\eb34' });
registerIcon('reactions', { character: '\eb35' });
registerIcon('references', { character: '\eb36' });
registerIcon('refresh', { character: '\eb37' });
registerIcon('regex', { character: '\eb38' });
registerIcon('remote-explorer', { character: '\eb39' });
registerIcon('remote', { character: '\eb3a' });
registerIcon('remove', { character: '\eb3b' });
registerIcon('replace-all', { character: '\eb3c' });
registerIcon('replace', { character: '\eb3d' });
registerIcon('repo-clone', { character: '\eb3e' });
registerIcon('repo-force-push', { character: '\eb3f' });
registerIcon('repo-pull', { character: '\eb40' });
registerIcon('repo-push', { character: '\eb41' });
registerIcon('report', { character: '\eb42' });
registerIcon('request-changes', { character: '\eb43' });
registerIcon('rocket', { character: '\eb44' });
registerIcon('root-folder-opened', { character: '\eb45' });
registerIcon('root-folder', { character: '\eb46' });
registerIcon('rss', { character: '\eb47' });
registerIcon('ruby', { character: '\eb48' });
registerIcon('save-all', { character: '\eb49' });
registerIcon('save-as', { character: '\eb4a' });
registerIcon('save', { character: '\eb4b' });
registerIcon('screen-full', { character: '\eb4c' });
registerIcon('screen-normal', { character: '\eb4d' });
registerIcon('search-stop', { character: '\eb4e' });
registerIcon('server', { character: '\eb50' });
registerIcon('settings-gear', { character: '\eb51' });
registerIcon('settings', { character: '\eb52' });
registerIcon('shield', { character: '\eb53' });
registerIcon('smiley', { character: '\eb54' });
registerIcon('sort-precedence', { character: '\eb55' });
registerIcon('split-horizontal', { character: '\eb56' });
registerIcon('split-vertical', { character: '\eb57' });
registerIcon('squirrel', { character: '\eb58' });
registerIcon('star-full', { character: '\eb59' });
registerIcon('star-half', { character: '\eb5a' });
registerIcon('symbol-class', { character: '\eb5b' });
registerIcon('symbol-color', { character: '\eb5c' });
registerIcon('symbol-constant', { character: '\eb5d' });
registerIcon('symbol-enum-member', { character: '\eb5e' });
registerIcon('symbol-field', { character: '\eb5f' });
registerIcon('symbol-file', { character: '\eb60' });
registerIcon('symbol-interface', { character: '\eb61' });
registerIcon('symbol-keyword', { character: '\eb62' });
registerIcon('symbol-misc', { character: '\eb63' });
registerIcon('symbol-operator', { character: '\eb64' });
registerIcon('symbol-property', { character: '\eb65' });
registerIcon('wrench', { character: '\eb65' });
registerIcon('wrench-subaction', { character: '\eb65' });
registerIcon('symbol-snippet', { character: '\eb66' });
registerIcon('tasklist', { character: '\eb67' });
registerIcon('telescope', { character: '\eb68' });
registerIcon('text-size', { character: '\eb69' });
registerIcon('three-bars', { character: '\eb6a' });
registerIcon('thumbsdown', { character: '\eb6b' });
registerIcon('thumbsup', { character: '\eb6c' });
registerIcon('tools', { character: '\eb6d' });
const triangleDown = registerIcon('triangle-down', { character: '\eb6e' });
const triangleLeft = registerIcon('triangle-left', { character: '\eb6f' });
const triangleRight = registerIcon('triangle-right', { character: '\eb70' });
const triangleUp = registerIcon('triangle-up', { character: '\eb71' });
registerIcon('twitter', { character: '\eb72' });
registerIcon('unfold', { character: '\eb73' });
registerIcon('unlock', { character: '\eb74' });
registerIcon('unmute', { character: '\eb75' });
registerIcon('unverified', { character: '\eb76' });
registerIcon('verified', { character: '\eb77' });
registerIcon('versions', { character: '\eb78' });
registerIcon('vm-active', { character: '\eb79' });
registerIcon('vm-outline', { character: '\eb7a' });
registerIcon('vm-running', { character: '\eb7b' });
registerIcon('watch', { character: '\eb7c' });
registerIcon('whitespace', { character: '\eb7d' });
registerIcon('whole-word', { character: '\eb7e' });
registerIcon('window', { character: '\eb7f' });
registerIcon('word-wrap', { character: '\eb80' });
registerIcon('zoom-in', { character: '\eb81' });
registerIcon('zoom-out', { character: '\eb82' });
registerIcon('list-filter', { character: '\eb83' });
registerIcon('list-flat', { character: '\eb84' });
registerIcon('list-selection', { character: '\eb85' });
registerIcon('selection', { character: '\eb85' });
registerIcon('list-tree', { character: '\eb86' });
registerIcon('debug-breakpoint-function-unverified', { character: '\eb87' });
registerIcon('debug-breakpoint-function', { character: '\eb88' });
registerIcon('debug-breakpoint-function-disabled', { character: '\eb88' });
registerIcon('debug-stackframe-active', { character: '\eb89' });
registerIcon('debug-stackframe-dot', { character: '\eb8a' });
registerIcon('debug-stackframe', { character: '\eb8b' });
registerIcon('debug-stackframe-focused', { character: '\eb8b' });
registerIcon('debug-breakpoint-unsupported', { character: '\eb8c' });
registerIcon('symbol-string', { character: '\eb8d' });
registerIcon('debug-reverse-continue', { character: '\eb8e' });
registerIcon('debug-step-back', { character: '\eb8f' });
registerIcon('debug-restart-frame', { character: '\eb90' });
registerIcon('debug-alternate', { character: '\eb91' });
registerIcon('call-incoming', { character: '\eb92' });
registerIcon('call-outgoing', { character: '\eb93' });
registerIcon('menu', { character: '\eb94' });
registerIcon('expand-all', { character: '\eb95' });
registerIcon('feedback', { character: '\eb96' });
registerIcon('group-by-ref-type', { character: '\eb97' });
registerIcon('ungroup-by-ref-type', { character: '\eb98' });
registerIcon('bell-dot', { character: '\f101' });
registerIcon('debug-alt-2', { character: '\f102' });
registerIcon('debug-alt', { character: '\f103' });

// // from base
// registerIcon(baseCodicons.breadcrumbSeparator.id, chevronRight);
// registerIcon(baseCodicons.menuSubmenu.id, chevronRight);
// registerIcon(baseCodicons.menuSelection.id, check);

// registerIcon(baseCodicons.menuBarMore.id, more);
// registerIcon(baseCodicons.toolBarMore.id, more);

// registerIcon(baseCodicons.listClose.id, close);

// registerIcon(baseCodicons.scrollbarButtonLeft.id, triangleLeft);
// registerIcon(baseCodicons.scrollbarButtonRight.id, triangleRight);
// registerIcon(baseCodicons.scrollbarButtonUp.id, triangleUp);
// registerIcon(baseCodicons.scrollbarButtonDown.id, triangleDown);


export const iconsSchemaId = 'vscode://schemas/icons';

let schemaRegistry = platform.Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(iconsSchemaId, iconRegistry.getIconSchema());

const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(iconsSchemaId), 200);
iconRegistry.onDidChangeSchema(() => {
	if (!delayer.isScheduled()) {
		delayer.schedule();
	}
});


// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
