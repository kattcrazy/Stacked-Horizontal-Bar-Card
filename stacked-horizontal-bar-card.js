// Stacked Horizontal Bar Card - A horizontal stacked bar (pie-chart-as-a-line) for Home Assistant
// Repository: https://github.com/kattcrazy/Stacked-Horizontal-Bar-Card
// Add type="module" to your resource:
//   - url: /local/stacked-horizontal-bar-card.js
//     type: module
//
import { html, css, LitElement, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

const DEFAULT_COLORS = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];

function parseNumber(val) {
  if (val === null || val === undefined) return 0;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.max(0, n);
}

function lightenColor(color) {
  if (!color || typeof color !== 'string') return color;
  if (color.trim().startsWith('var(')) {
    return `color-mix(in srgb, ${color} 75%, white)`;
  }
  const hex = color.replace(/^#/, '');
  if (hex.length !== 6 && hex.length !== 8) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const factor = 0.35;
  const nr = Math.min(255, Math.round(r + (255 - r) * factor));
  const ng = Math.min(255, Math.round(g + (255 - g) * factor));
  const nb = Math.min(255, Math.round(b + (255 - b) * factor));
  return `rgb(${nr},${ng},${nb})`;
}

class StackedHorizontalBarCard extends LitElement {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { type: Object, state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this._config = null;
  }

  static getConfigElement() {
    return document.createElement('stacked-horizontal-bar-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:stacked-horizontal-bar-card',
      entities: [],
      sort: 'highest',
      show_legend: true,
      show_state: 'legend',
      bar_radius: 4,
      bar_height: 24,
    };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid config');
    const entities = Array.isArray(config.entities) ? config.entities : [];
    this._config = { ...config, entities };
  }

  _getSortedSegments() {
    const cfg = this._config;
    if (!this.hass || !cfg || !cfg.entities.length) return [];

    const validEntities = cfg.entities.filter((e) => e && e.entity);
    const segments = validEntities.map((ent, idx) => {
      const state = this.hass.states[ent.entity];
      const value = state ? parseNumber(state.state) : 0;
      const name = ent.name != null && ent.name !== '' ? ent.name : (state?.attributes?.friendly_name || ent.entity);
      const color = ent.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      return {
        entity: ent.entity,
        name,
        value,
        color,
        order: ent.order != null ? ent.order : idx,
      };
    });

    const sort = cfg.sort || 'highest';
    segments.sort((a, b) => {
      if (sort === 'custom') return (a.order ?? 0) - (b.order ?? 0);
      if (sort === 'abc') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'cba') return (b.name || '').localeCompare(a.name || '');
      if (sort === 'highest') return b.value - a.value;
      if (sort === 'lowest') return a.value - b.value;
      return 0;
    });

    return segments;
  }

  _getCardContent() {
    const cfg = this._config;
    const segments = this._getSortedSegments();
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const barHeight = cfg.bar_height ?? 24;
    const barRadius = cfg.bar_radius ?? 4;
    const showState = cfg.show_state || 'legend';
    const showOnBar = showState === 'bar' || showState === 'both';
    const showLegend = cfg.show_legend !== false;
    const showInLegend = showState === 'legend' || showState === 'both';

    if (segments.length === 0 || total <= 0) {
      const noBg = cfg.remove_background === true;
      return html`
        <div class="card-content empty ${noBg ? 'no-bg' : ''}">
          <span class="empty-text">No data</span>
        </div>
      `;
    }

    const barRadiusPx = typeof barRadius === 'number' ? `${barRadius}px` : String(barRadius);
    const gradient = cfg.gradient || 'none';
    const barEls = segments.map((seg, i) => {
      const pct = (seg.value / total) * 100;
      const isFirst = i === 0;
      const isLast = i === segments.length - 1;
      const radius = `${isFirst ? barRadiusPx : 0} ${isLast ? barRadiusPx : 0} ${isLast ? barRadiusPx : 0} ${isFirst ? barRadiusPx : 0}`;
      let bg = seg.color;
      if (gradient === 'left') bg = `linear-gradient(90deg, ${seg.color}, ${lightenColor(seg.color)})`;
      else if (gradient === 'right') bg = `linear-gradient(90deg, ${lightenColor(seg.color)}, ${seg.color})`;
      return html`
        <div
          class="segment"
          style="width:${pct}%;background:${bg};border-radius:${radius}"
          title="${seg.name}: ${seg.value}"
        >
          ${showOnBar && pct > 8 ? html`<span class="segment-value">${seg.value}</span>` : nothing}
        </div>
      `;
    });

    const legendEl = showLegend
      ? html`
          <div class="legend">
            ${segments.map(
              (seg) => {
                let swatchBg = seg.color;
                if (gradient === 'left') swatchBg = `linear-gradient(90deg, ${seg.color}, ${lightenColor(seg.color)})`;
                else if (gradient === 'right') swatchBg = `linear-gradient(90deg, ${lightenColor(seg.color)}, ${seg.color})`;
                return html`
                <div class="legend-item">
                  <span class="legend-swatch" style="background:${swatchBg}"></span>
                  <span class="legend-label">${seg.name}${showInLegend ? `: ${seg.value}` : ''}</span>
                </div>
              `;
              }
            )}
          </div>
        `
      : nothing;

    const titleEl =
      cfg.title != null && cfg.title !== ''
        ? html`<div class="card-title">${cfg.title}</div>`
        : nothing;

    const titlePos = cfg.title_position || 'top';
    const legendPos = cfg.legend_position || 'bottom';
    const hasTitle = cfg.title != null && cfg.title !== '';

    const topParts = [];
    if (titlePos === 'top' && hasTitle) topParts.push(titleEl);
    if (legendPos === 'top' && showLegend) topParts.push(legendEl);
    const bottomParts = [];
    if (legendPos === 'bottom' && showLegend) bottomParts.push(legendEl);
    if (titlePos === 'bottom' && hasTitle) bottomParts.push(titleEl);
    const topBlock = topParts.length ? html`${topParts}` : null;
    const bottomBlock = bottomParts.length ? html`${bottomParts}` : null;
    const noBg = cfg.remove_background === true;

    return html`
      <div class="card-content ${noBg ? 'no-bg' : ''}">
        ${topBlock ? html`<div class="top">${topBlock}</div>` : nothing}
        <div class="bar-container" style="${noBg ? 'flex:1;min-height:0;height:100%' : `height:${barHeight}px`}">
          <div class="bar" style="border-radius:${barRadiusPx}">${barEls}</div>
        </div>
        ${bottomBlock ? html`<div class="bottom">${bottomBlock}</div>` : nothing}
      </div>
    `;
  }

  render() {
    if (!this._config) return nothing;
    const noBg = this._config.remove_background === true;
    return html` <ha-card class="${noBg ? 'no-bg' : ''}">${this._getCardContent()}</ha-card> `;
  }

  static styles = css`
    ha-card {
      background: var(--ha-card-background, var(--card-background-color, var(--sidebar-background-color)));
      border-radius: var(--ha-card-border-radius, 12px);
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    ha-card.no-bg {
      background: transparent;
      border-radius: 0;
    }
    .card-content {
      padding: 12px 16px;
      color: var(--primary-text-color);
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .card-content.no-bg {
      padding: 0;
    }
    .card-content.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      flex: 1;
    }
    .empty-text {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .card-title:last-child {
      margin-bottom: 0;
    }
    .top {
      margin-bottom: 12px;
      flex: 1;
      min-height: 0;
    }
    .bar-container {
      width: 100%;
      overflow: hidden;
      flex-shrink: 0;
    }
    .card-content.no-bg .bar-container {
      flex: 1;
      flex-shrink: 1;
      min-height: 0;
    }
    .bottom {
      margin-top: 12px;
      flex: 1;
      min-height: 0;
    }
    .bar {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .segment {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      transition: width 0.3s ease;
    }
    .segment-value {
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      padding: 0 4px;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      color: var(--primary-text-color);
    }
  `;
}

customElements.define('stacked-horizontal-bar-card', StackedHorizontalBarCard);

// Editor
class StackedHorizontalBarCardEditor extends LitElement {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { type: Object, state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this._config = {};
  }

  setConfig(config) {
    this._config = config || {};
    if (!Array.isArray(this._config.entities)) {
      this._config.entities = [];
    }
  }

  _fire(type, detail) {
    const event = new Event(type, { bubbles: true, cancelable: false, composed: true });
    event.detail = detail;
    this.dispatchEvent(event);
  }

  _valueChanged(field, value) {
    const cfg = { ...this._config };
    if (value === '' || value === null || value === undefined) {
      delete cfg[field];
    } else {
      cfg[field] = value;
    }
    this._config = cfg;
    this._fire('config-changed', { config: cfg });
  }

  _entityChanged(index, field, value) {
    const entities = [...(this._config.entities || [])];
    if (!entities[index]) entities[index] = { entity: '' };
    if (value === '' || value === null || value === undefined) {
      delete entities[index][field];
    } else {
      entities[index][field] = value;
    }
    if (field === 'entity' && value === '') {
      entities.splice(index, 1);
    } else {
      this._valueChanged('entities', entities);
    }
  }

  _addEntity() {
    const entities = [...(this._config.entities || []), { entity: '' }];
    this._valueChanged('entities', entities);
  }

  _removeEntity(index) {
    const entities = [...(this._config.entities || [])];
    entities.splice(index, 1);
    this._valueChanged('entities', entities);
  }

  render() {
    const c = this._config;
    const entities = c.entities || [];

    return html`
      <div class="editor">
        <div class="section">
          <div class="section-header">Title</div>
          <div class="option-row">
            <label class="option-label">Title</label>
            <input
              type="text"
              class="input"
              .value=${c.title ?? ''}
              placeholder="Card title"
              @input=${(e) => this._valueChanged('title', e.target.value)}
            />
          </div>
          <div class="option-row">
            <label class="option-label">Position</label>
            <select
              class="select"
              .value=${c.title_position ?? 'top'}
              @change=${(e) => this._valueChanged('title_position', e.target.value)}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>

        <div class="section">
          <div class="section-header">Legend</div>
          <div class="option-row">
            <label class="option-label">
              <input
                type="checkbox"
                .checked=${c.show_legend !== false}
                @change=${(e) => this._valueChanged('show_legend', e.target.checked)}
              />
              Show legend
            </label>
          </div>
          <div class="option-row">
            <label class="option-label">Position</label>
            <select
              class="select"
              .value=${c.legend_position ?? 'bottom'}
              @change=${(e) => this._valueChanged('legend_position', e.target.value)}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Show state</label>
            <select
              class="select"
              .value=${c.show_state ?? 'legend'}
              @change=${(e) => this._valueChanged('show_state', e.target.value)}
            >
              <option value="bar">On bar</option>
              <option value="legend">In legend</option>
              <option value="both">Both</option>
              <option value="none">Neither</option>
            </select>
          </div>
        </div>

        <div class="section">
          <div class="section-header">Bar</div>
          <div class="option-row">
            <label class="option-label">
              <input
                type="checkbox"
                .checked=${!!c.remove_background}
                @change=${(e) => this._valueChanged('remove_background', e.target.checked)}
              />
              Remove background
            </label>
          </div>
          <div class="option-help">When enabled, removes the card background and makes the bar stretch to fill the grid cell</div>
          <div class="option-row">
            <label class="option-label">Gradient</label>
            <select
              class="select"
              .value=${c.gradient ?? 'none'}
              @change=${(e) => this._valueChanged('gradient', e.target.value)}
            >
              <option value="none">None</option>
              <option value="left">Left to right</option>
              <option value="right">Right to left</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Sort</label>
            <select class="select" .value=${c.sort ?? 'highest'} @change=${(e) => this._valueChanged('sort', e.target.value)}>
              <option value="abc">A–Z</option>
              <option value="cba">Z–A</option>
              <option value="highest">Highest first</option>
              <option value="lowest">Lowest first</option>
              <option value="custom">Custom (use order)</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Bar height (px)</label>
            <input
              type="number"
              class="input"
              min="8"
              max="128"
              .value=${c.bar_height ?? 24}
              @input=${(e) => this._valueChanged('bar_height', parseInt(e.target.value) || 24)}
            />
          </div>
          <div class="option-row">
            <label class="option-label">Bar radius (px)</label>
            <input
              type="number"
              class="input"
              min="0"
              max="24"
              .value=${c.bar_radius ?? 4}
              @input=${(e) => this._valueChanged('bar_radius', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div class="section">
          <div class="section-header">Entities</div>
          <div class="option-help">Add entities with numeric state. Values are shown as proportions.</div>
          ${entities.map(
            (ent, i) => html`
              <div class="entity-row">
                <div class="entity-fields">
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${ent.entity || ''}
                    allow-custom-entity
                    @value-changed=${(e) => {
                      const v = e.detail?.value ?? e.detail?.entity_id ?? '';
                      this._entityChanged(i, 'entity', v);
                    }}
                  ></ha-entity-picker>
                  <input
                    type="text"
                    class="input"
                    .value=${ent.name ?? ''}
                    placeholder="Name override"
                    @input=${(e) => this._entityChanged(i, 'name', e.target.value || undefined)}
                  />
                  <input
                    type="text"
                    class="input color-input"
                    .value=${ent.color ?? ''}
                    placeholder="Color (hex or var)"
                    @input=${(e) => this._entityChanged(i, 'color', e.target.value || undefined)}
                  />
                  ${(c.sort || 'highest') === 'custom'
                    ? html`
                        <input
                          type="number"
                          class="input order-input"
                          .value=${ent.order ?? i}
                          placeholder="Order"
                          min="0"
                          @input=${(e) => this._entityChanged(i, 'order', parseInt(e.target.value))}
                        />
                      `
                    : nothing}
                </div>
                <button class="remove-btn" @click=${() => this._removeEntity(i)} title="Remove">
                  <ha-icon icon="mdi:delete"></ha-icon>
                </button>
              </div>
            `
          )}
          <button class="add-btn" @click=${this._addEntity}>
            <ha-icon icon="mdi:plus"></ha-icon> Add entity
          </button>
        </div>
      </div>
    `;
  }

  static styles = css`
    .editor {
      padding: 16px;
      background: var(--ha-card-background, var(--card-background-color));
      color: var(--primary-text-color);
      font-family: var(--mdc-typography-font-family, Roboto, sans-serif);
    }
    .section {
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(var(--rgb-primary-background-color, 255, 255, 255), 0.05);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .option-row {
      margin-bottom: 12px;
    }
    .option-row:last-of-type {
      margin-bottom: 0;
    }
    .option-label {
      display: block;
      font-size: 14px;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }
    .option-label input[type='checkbox'],
    .checkbox-label input[type='checkbox'] {
      margin-right: 10px;
      width: 20px;
      height: 20px;
      min-width: 20px;
      min-height: 20px;
      cursor: pointer;
    }
    .option-help {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .input,
    .select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--ha-card-background, var(--card-background-color));
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }
    .input:focus,
    .select:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .select {
      cursor: pointer;
      max-width: 200px;
    }
    .entity-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
    }
    .entity-fields {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .entity-fields ha-entity-picker,
    .entity-fields .input {
      flex: 1;
      min-width: 120px;
    }
    .entity-fields .color-input {
      min-width: 100px;
      max-width: 140px;
    }
    .entity-fields .order-input {
      width: 60px;
      min-width: 60px;
    }
    .entity-fields .full {
      min-width: 180px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .checkbox-label input {
      margin-right: 6px;
    }
    .remove-btn {
      padding: 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .remove-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
    }
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px dashed var(--divider-color);
      background: transparent;
      color: var(--primary-color);
      font-size: 14px;
      cursor: pointer;
      width: 100%;
      justify-content: center;
    }
    .add-btn:hover {
      background: rgba(var(--rgb-primary-color), 0.1);
      border-color: var(--primary-color);
    }
    ha-entity-picker {
      width: 100%;
    }
  `;
}

customElements.define('stacked-horizontal-bar-card-editor', StackedHorizontalBarCardEditor);
