import {
	Plugin
} from 'obsidian';
import {DEFAULT_SETTINGS, Settings, ZenPreferences} from "./types";
import {SettingsTab} from "./settings";

import {VIEW_TYPE_ZEN} from "./constants";
import {ZenLeaf, ZenView} from "./ZenView";
import {Integrator} from "./integrator";
import {pluginIntegrations} from "./plugin.integrations";

export default class Zen extends Plugin {
	settings: Settings;
	zenView: ZenView;
	integrator: Integrator;

	async onload() {
		console.log(`${this.manifest.name}: Loading`);

		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerView(VIEW_TYPE_ZEN, (leaf: ZenLeaf) => {
			leaf.setPinned(false);
			leaf.detach();
			this.zenView = new ZenView(leaf, this);
			return this.zenView;
		});

		this.addCommand({
			id: 'toggle',
			name: 'Toggle',
			callback: () => {
				this.zenView.toggleZen();
			}
		});

		this.integrator = new Integrator(this.app, this);
		this.integrator.load(pluginIntegrations);
		this.app.workspace.onLayoutReady(async () => {
			await this.initLeaf();
		});
	}

	async initLeaf(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_ZEN);

		await this.app.workspace.getLeftLeaf(false).setViewState({
			type: VIEW_TYPE_ZEN,
			active: false
		});
	}

	async onunload() {
		console.log(`${this.manifest.name}: Unloading`);
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_ZEN);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);

		this.zenView.removeGlobalClasses();
		this.zenView.addGlobalClasses();

		if (this.settings.enabled) {
			this.zenView.removeBodyClasses();
			this.zenView.addBodyClasses();
		}
	}
}



