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
| `alignment` | `left` \| `center` \| `right` | `left` | Horizontal alignment for both title and legend |
| `show_title` | boolean | `true` | Show title |
| `title` | string | — | Card title text |
| `title_position` | `top` \| `bottom` | `top` | Title placement |
| `show_legend` | boolean | `true` | Show legend with labels |
| `legend_position` | `top` \| `bottom` | `bottom` | Legend placement |
| `show_state` | `bar` \| `legend` \| `both` \| `none` | `legend` | Where to show entity values |
| `sort` | `abc` \| `cba` \| `highest` \| `lowest` \| `custom` | `highest` | Segment order (left → right) |
| `bar_height` | number \| `auto` | `24` | Bar height in px; use `auto` to fill space between title/legend |
| `bar_radius` | number | theme | Bar segment border-radius (px); omit for theme default |
| `gradient` | `none` \| `left` \| `right` \| `center` \| `top` \| `bottom` | `none` | Gradient direction |
| `fill_card` | boolean | `false` | Remove card background; bar fills grid cell; hides title/legend |
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

alignment: left              # left | center | right (applies to title and legend)
show_title: true
title: Energy Usage
title_position: top          # top | bottom

show_legend: true
legend_position: bottom      # top | bottom
show_state: legend           # legend | bar | both | none

sort: highest                # abc | cba | highest | lowest | custom

bar_height: 24               # number or 'auto' to fill space between title/legend
# bar_radius: 8              # omit for theme default
gradient: none               # none | left | right | center | top | bottom
fill_card: false             # true = no card bg, bar fills grid cell, hides title/legend

entities:
  - entity: sensor.grid_usage
    name: Grid               # omit to use friendly_name
    color: '#4472C4'
    order: 1                 # used when sort: custom

```

## About
This is my first Home Assistant card that I will be maintaining for public use. I have tested it on my own setup and it works perfectly! Please report an issue if something doesn't work, I'll try my best to fix it.

Support me [here](https://kattcrazy.nz/product/support-me/)
