const margin = {top: 40, right: 30, bottom: 60, left: 70};
const width = 950 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load cleaned data
d3.csv("data/oecd_clean.csv").then(data => {

    data.forEach(d => {
        d.Year = +d.Year;
        d.Value = +d.Value;
    });

    const countries = [...new Set(data.map(d => d.Country))].sort();

    // Populate Dropdown
    const dropdown = d3.select("#countryFilter");
    dropdown.append("option").text("All Countries").attr("value", "ALL");

    dropdown.selectAll("option.country")
        .data(countries)
        .enter()
        .append("option")
        .attr("class", "country")
        .text(d => d)
        .attr("value", d => d);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const r = d3.scaleSqrt().range([3, 30]);
    const color = d3.scaleOrdinal(d3.schemeSet2);

    function updateChart(selected = "ALL") {

        let filtered = selected === "ALL"
            ? data
            : data.filter(d => d.Country === selected);

        x.domain(d3.extent(data, d => d.Year));
        y.domain([0, d3.max(data, d => d.Value)]);
        r.domain(d3.extent(data, d => d.Value));

        svg.selectAll("*").remove();

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Bubbles
        svg.selectAll("circle")
            .data(filtered)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(d.Value))
            .attr("r", 0)
            .attr("fill", d => color(d.Country))
            .style("opacity", 0.8)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(150).style("opacity", .95);
                tooltip.html(
                    `<b>${d.Country}</b><br>
                     Year: ${d.Year}<br>
                     Emissions: ${d.Value}`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0))
            .transition()
            .duration(900)
            .attr("r", d => r(d.Value));
    }

    // Initial load
    updateChart();

    dropdown.on("change", function () {
        updateChart(this.value);
    });
});
