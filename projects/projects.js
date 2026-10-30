import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);

  let data = rolledData.map(([year, count]) => {
    return {value: count, label: year};
  });

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  d3.select('svg').selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;

          d3.select("svg")
          .selectAll("path")
          .attr("class", (_, i) => i === selectedIndex ? "selected" : "");

          legend
          .selectAll('li')
          .attr('class', (_, i) => i === selectedIndex ? 'legend-item selected' : 'legend-item');

          if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
          } else {
            let selectedYear = data[selectedIndex].label;
            let filteredProjects = projects.filter((project) => {
              return project.year === selectedYear;
            });
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
        });
  })

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
}

let selectedIndex = -1;

renderPieChart(projects);

let query = "";

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});