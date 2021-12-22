<template>
  <div class="overflow-auto">
    <div class="contrib-graph">
      <ul class="contrib-months">
        <li>Jan</li>
        <li>Feb</li>
        <li>Mar</li>
        <li>Apr</li>
        <li>May</li>
        <li>Jun</li>
        <li>Jul</li>
        <li>Aug</li>
        <li>Sep</li>
        <li>Oct</li>
        <li>Nov</li>
        <li>Dec</li>
      </ul>
      <ul class="contrib-days">
        <li>Sun</li>
        <li>Mon</li>
        <li>Tue</li>
        <li>Wed</li>
        <li>Thu</li>
        <li>Fri</li>
        <li>Sat</li>
      </ul>
      <ul class="contrib-squares">
        <!-- added via javascript -->
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ContribGraph extends Vue {
  // length: 364, elem: 0, 1, 2, 3
  @Prop() readonly data: number[] | undefined;

  mounted() {
    let data: number[] = [];
    if (this.data) {
      data = this.data;
    } else {
      for (let i = 1; i < 365; i++) {
        data.push(Math.floor(Math.random() * 3));
      }
    }
    const squares = this.$el.querySelector('.contrib-squares')!;
    for (let x of data) {
      squares.insertAdjacentHTML('beforeend', `<li data-level="${x}"></li>`);
    }
  }
}
</script>

<style>
:root {
  --square-size: 10px;
  --square-gap: 3px;
  --week-width: calc(var(--square-size) + var(--square-gap));
}

.contrib-months {
  grid-area: months;
}
.contrib-days {
  grid-area: days;
}
.contrib-squares {
  grid-area: squares;
}

.contrib-graph {
  display: inline-grid;
  grid-template-areas:
    'empty months'
    'days squares';
  grid-template-columns: auto 1fr;
  grid-gap: 10px;
}

.contrib-months {
  display: grid;
  grid-template-columns:
    calc(var(--week-width) * 4) /* Jan */
    calc(var(--week-width) * 4) /* Feb */
    calc(var(--week-width) * 4) /* Mar */
    calc(var(--week-width) * 5) /* Apr */
    calc(var(--week-width) * 4) /* May */
    calc(var(--week-width) * 4) /* Jun */
    calc(var(--week-width) * 5) /* Jul */
    calc(var(--week-width) * 4) /* Aug */
    calc(var(--week-width) * 4) /* Sep */
    calc(var(--week-width) * 5) /* Oct */
    calc(var(--week-width) * 4) /* Nov */
    calc(var(--week-width) * 5) /* Dec */;
}

.contrib-days,
.contrib-squares {
  display: grid;
  grid-gap: var(--square-gap);
  grid-template-rows: repeat(7, var(--square-size));
}

.contrib-squares {
  grid-auto-flow: column;
  grid-auto-columns: var(--square-size);
}

/* Other styling */

.contrib-graph {
  padding: 20px;
  border: 1px #e1e4e8 solid;
  margin: 20px;
}

.contrib-days {
  font-size: 10px;
  line-height: 10px !important;
  padding-left: 0 !important;
}

.contrib-months {
  font-size: 10px;
  line-height: 10px !important;
  padding-left: 0 !important;
}

.contrib-days li:nth-child(odd) {
  visibility: hidden;
}

.contrib-days li {
  list-style-type: none;
}

.contrib-months li {
  list-style-type: none;
}

.contrib-squares {
  padding-left: 0 !important;
}

.contrib-squares li {
  background-color: #ebedf0;
  list-style-type: none;
}

.contrib-squares li[data-level='1'] {
  background-color: #c6e48b;
}

.contrib-squares li[data-level='2'] {
  background-color: #7bc96f;
}

.contrib-squares li[data-level='3'] {
  background-color: #196127;
}
</style>
