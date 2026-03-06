# Stacked Horizontal Bar Card

A Home Assistant Lovelace card that displays a horizontal stacked bar — like a pie chart in a line. Each segment represents an entity's numeric value with configurable colors, gradients, and ordering.

![Header](images/Header.png)

## Installation

<details>
<summary><strong>HACS (recommended)</strong></summary>

1. Open HACS
2. Click the three dots in the top right, then 'Custom repositories'
3. Paste `https://github.com/kattcrazy/Stacked-Horizontal-Bar-Card` and select "Dashboard"
4. Search for 'Stacked Horizontal Bar Card' in HACS and download
5. Reload your page!

</details>

<details>
<summary><strong>Manual</strong></summary>

1. Download `stacked-horizontal-bar-card.js` from the [releases](https://github.com/kattcrazy/Stacked-Horizontal-Bar-Card/releases) page
2. Place it in your `config/www/` folder
3. Add the resource in the Lovelace config:
```yaml
resources:
  - url: /local/stacked-horizontal-bar-card.js
    type: module
```
4. Refresh your dashboard or Home Assistant if needed

</details>

## Configuration

### Card options

All options support Jinja templates (strings containing `{{ }}`).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alignment` | `left`, `center`, `right` | `left` | Horizontal alignment for both title and legend |
| `show_title` | boolean | `true` | Show title |
| `title` | string | — | Card title text |
| `title_position` | `top`, `bottom` | `top` | Title placement |
| `show_legend` | boolean | `true` | Show legend with labels |
| `legend_show_zero` | boolean | `true` | Include entities with 0 value in legend |
| `legend_position` | `top`, `bottom` | `bottom` | Legend placement |
| `show_state` | `bar`, `legend`, `both`, `none` | `legend` | Where to show entity values |
| `sort` | `abc`, `cba`, `highest`, `lowest`, `custom` | `highest` | Segment order (left → right) |
| `bar_radius` | number | theme | Bar segment border-radius (px); omit for theme default |
| `gradient` | `none`, `left`, `right`, `center`, `top`, `bottom` | `none` | Gradient direction |
| `fill_card` | boolean | `false` | Remove card background; bar fills grid cell; hides title/legend |
| `entities` | array | `[]` | Entity list (see below) |

### Entity options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | required | Entity ID (e.g. `sensor.battery_level`) or Jinja template (e.g. `"{{states('sensor.battery_level')}}) |
| `name` | string | — | Override name; omit to use friendly name. Supports Jinja. |
| `color` | string | auto | Hex (e.g. `#FF0000`) or HA variable. Supports Jinja. |
| `order` | number | — | Used when `sort: custom`. Supports Jinja. |

Entities must have numeric values (from entity state or from a Jinja template in `entity`). Proportions are computed from the sum.

<details>
<summary><strong>UI config</strong></summary>

<p><img src="images/Config-1.png" alt="Config 1"></p>
<p><img src="images/Config-2.png" alt="Config 2"></p>

</details>

### Use as a progress bar

```yaml
type: custom:stacked-horizontal-bar-card
entities:
  - entity: "{{ states('sensor.percent_finished') | float }}" # Your entity here
    name: Completed
    color: '#2196F3'  # Your colour here
    order: 1
  - entity: "{{ 100 - states('sensor.percent_finished') | float }}" # Your entity here
    name: Remaining
    color: '#E0E0E0' # Dimmer/brighter version of the colour here
    order: 2
show_legend: false
show_state: none
sort: custom
```


### Full config with all options
For your copy-paste convenience!

```yaml
type: custom:stacked-horizontal-bar-card

alignment: left/center/right
show_title: true/false
title: Energy Usage
title_position: top/bottom

show_legend: true/false
legend_show_zero: true/false
legend_position: top/bottom

show_state: legend/bar/both/none

sort: abc/cba/highest/lowest/custom

bar_radius: 8                # omit for theme default
gradient: none/left/right/center/top/bottom
fill_card: true/false

entities:
  - entity: sensor.grid_usage  # Or use Jinja templating
    name: Grid
    color: '#4472C4'
    order: 1
 

```

## Config Examples

![Liquid Ice](images/Liquid-ice.png) ![Light](images/Light.png) ![Dark](images/Dark.png)

<details>
<summary><strong>1</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: false
show_state: none
sort: highest
bar_height: 90
bar_radius: 8
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
legend_position: bottom
title_position: top
grid_options:
  columns: 12
  rows: 2
remove_background: false
gradient: none
```

</details>

<details>
<summary><strong>2</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: true
show_state: none
sort: abc
bar_height: 24
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
legend_position: top
title_position: bottom
gradient: right
title: Protocols
grid_options:
  columns: 12
  rows: auto
fill_card: false
show_title: true
```

</details>

<details>
<summary><strong>3</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: true
show_state: bar
sort: custom
bar_height: auto
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
    order: 1
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
    order: 2
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
    order: 3
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
    order: 4
legend_position: bottom
title_position: bottom
gradient: top
title: Protocols
grid_options:
  columns: 12
  rows: 2
fill_card: false
show_title: true
alignment: right
bar_radius: 0
```

</details>

<details>
<summary><strong>4</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: true
show_state: legend
sort: cba
bar_height: auto
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
    order: 1
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
    order: 2
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
    order: 3
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
    order: 4
legend_position: top
title_position: bottom
gradient: top
title: Protocols
grid_options:
  columns: 12
  rows: 2
fill_card: false
show_title: false
alignment: center
bar_radius: 100
```

</details>

<details>
<summary><strong>5</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: false
show_state: none
sort: cba
bar_height: auto
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
legend_position: bottom
title_position: top
grid_options:
  columns: 12
  rows: 4
gradient: none
alignment: center
fill_card: true
bar_radius: 0
```

</details>

<details>
<summary><strong>6</strong></summary>

```yaml
type: custom:stacked-horizontal-bar-card
show_legend: true
show_state: bar
sort: lowest
bar_height: auto
entities:
  - entity: sensor.wifi_devices
    name: Wifi
    gradient: true
    color: "#7CD5FD"
  - entity: sensor.local_devices
    name: Local
    gradient: true
    color: "#A2D7A4"
  - entity: sensor.z2mqtt_devices
    gradient: true
    color: "#FFDE7A"
    name: Z2MQTT
  - entity: sensor.unlabelled_devices
    gradient: true
    color: "#BCBCBC"
    name: Unlabelled
legend_position: bottom
title_position: top
grid_options:
  columns: 12
  rows: 4
gradient: left
alignment: center
fill_card: false
title: Protocols
```

</details>

## To-Do
- Add more example use cases like the progress bar

## About
This is my first Home Assistant card that I will be maintaining for public use. I have tested it on my own setup and it works perfectly! Please report an issue if something doesn't work, I'll try my best to fix it.

Support me [here](https://kattcrazy.nz/product/support-me/)
