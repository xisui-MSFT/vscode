/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class Codicon {
	constructor(public readonly id: string) {
	}
	public get className() { return 'codicon codicon-' + this.id; }
	public get cssSelector() { return '.codicon.codicon-' + this.id; }
}

export const breadcrumbSeparator = new Codicon('breadcrumb-separator');

export const menuSelection = new Codicon('menu-selection');
export const menuSubmenu = new Codicon('menu-submenu');

export const listClose = new Codicon('list-close');

export const toolBarMore = new Codicon('toolbar-more');
export const menuBarMore = new Codicon('menubar-more');

export const scrollbarButtonLeft = new Codicon('scrollbar-button-left');
export const scrollbarButtonRight = new Codicon('scrollbar-button-right');
export const scrollbarButtonUp = new Codicon('scrollbar-button-up');
export const scrollbarButtonDown = new Codicon('scrollbar-button-down');
