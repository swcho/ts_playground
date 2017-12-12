Water Simulation
===

[Origin](https://codepen.io/svnt/pen/BdwBLp)

Create ground height value. Half with multi-sine, other half with random value.

Create water height value with 0 except the value of center which has 250.

Create ground/water element.

Draw ground/water element just determining height of element since parent element layout is done by `flex`, `justify-content: flex-end`, `flex: 1 100%`.

>Well, the rules are simple; each cell has 3 stored values; elevation, water volume, and kinetic energy (+/-, depends on direction). Each cell has some emergent values from those: 'potential energy' (elevation+volume) and 2 directional pressures (potential energy +/- kinetic energy, depends on direction). Each cell finds the difference between the left directional pressure of itself and the right directional pressure of its left neighbor (Ldif) and the difference between the right directional pressure of itself and the left directional pressure of its left neighbor (Rdif). From those, each cell finds 2 'flow' values, 1 for each direction, calculated by the minimum value of either total volume/4 or directional difference value/4. This flow value, if positive, determines how much volume to subtract from itself, how much to add to its neighbor in that direction, and how much energy to add to its neighbor in that direction. At the end of very iteration, the added/subtracted volume values are added/subtracted from their corresponding cells, and the energy value of every cell is divided by 2 before the new energy value is added onto it.

Energy has directional value `-` is energy towards left, `+` is energy towards right.

Give water to left cell if energy toward left exceeded energy of left cell.

Give water to right cell if energy toward right exceeded energy of right cell.
