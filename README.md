# Stacked Horizontal Bar Card

A Home Assistant Lovelace card that displays a horizontal stacked bar — like a pie chart in a line. Each segment represents an entity's numeric value with configurable colors, gradients, and ordering.

## Installation

### HACS (recommended)

1. Open HACS
2. Click the three dots in the top right, then 'Custom repositories'
3. Paste `https://github.com/kattcrazy/Stacked-Horizontal-Bar-Card` and select "Dashboard"
4. Search for 'Stacked Horizontal Bar Card' in HACS and download
5. Reload your page!

### Manual

1. Download `stacked-horizontal-bar-card.js` from the [releases](https://github.com/kattcrazy/Stacked-Horizontal-Bar-Card/releases) page
2. Place it in your `config/www/` folder
3. Add the resource in the Lovelace config:
```yaml
resources:
  - url: /local/stacked-horizontal-bar-card.js
    type: module
```
4. Refresh your dashboard or Home Assistant if needed

## Configuration

### Card options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | — | Card title. Empty = hide |
| `title_position` | `top` \| `bottom` | `top` | Title placement |
| `title_alignment` | `left` \| `center` \| `right` | `left` | Title horizontal alignment |
| `show_legend` | boolean | `true` | Show legend with labels |
| `legend_position` | `top` \| `bottom` | `bottom` | Legend placement |
| `legend_alignment` | `left` \| `center` \| `right` | `left` | Legend horizontal alignment |
| `show_state` | `bar` \| `legend` \| `both` \| `none` | `legend` | Where to show entity values |
| `sort` | `abc` \| `cba` \| `highest` \| `lowest` \| `custom` | `highest` | Segment order (left → right) |
| `bar_autofill` | boolean | `false` | Bar fills card height (with padding); overrides bar_height |
| `bar_height` | number | `24` | Bar height in pixels (ignored when bar_autofill) |
| `bar_radius` | number | theme | Bar segment border-radius (px); omit for theme default |
| `gradient` | `none` \| `left` \| `right` \| `center` \| `top` \| `bottom` | `none` | Gradient direction |
| `remove_background` | boolean | `false` | Remove card background; bar fills the grid cell |
| `entities` | array | `[]` | Entity list (see below) |
| `grid_options` | object | — | Passed through for dashboard layout |

### Entity options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | required | Entity ID |
| `name` | string | — | Override name; omit to use friendly name |
| `color` | string | auto | Hex (e.g. `#FF0000`) or HA variable (e.g. `var(--primary-color)`) |
| `order` | number | — | Used when `sort: custom` |

Entities must have numeric `state` values. Proportions are computed from the sum of all values.

## Example

Full config with all options :

```yaml
type: custom:stacked-horizontal-bar-card

title: Energy Usage
title_position: top /bottom

show_legend: true
legend_position: top/bottom 
show_state: legend/bar/both/none

sort: abc/cba/highest/lowest/custom

bar_height: 32
# bar_radius: 8             # omit for theme default
gradient: none              # none | left | right | center | top | bottom
# remove_background: false   # true = no card bg, bar fills grid cell

entities:
  - entity: sensor.grid_usage
    name: Grid              # omit to use friendly_name
    color: '#4472C4'
    order: 1

```

## About
This is my first Home Assistant card that I will be maintaining for public use. I have tested it on my own setup and it works perfectly! Please report an issue if something doesn't work, I'll try my best to fix it.

Support me [here](https://kattcrazy.nz/product/support-me/)
