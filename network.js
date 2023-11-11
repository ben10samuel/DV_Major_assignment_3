
function simulate(data,svg)
{
    let width = parseInt(svg.attr("viewBox").split(' ')[3])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])

    let main_group = svg.append("g")
        .attr("transform", "translate(0, 5)")

    //calculate degree of the nodes:
    let node_degree={}; //initiate an object
    d3.map(data.links,function(d){
        if(node_degree.hasOwnProperty(d.source))
        {
            node_degree[d.source]++;
        }
        else{
            node_degree[d.source]=0;
        }
        if(node_degree.hasOwnProperty(d.target))
        {
            node_degree[d.target]++;
        }
        else{
            node_degree[d.target]=0;
        }
    });
    let scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([5,15])
    function showAuthorDetails(d) {
        d3.select("#authorName").text("Author: " + d.Name);
        d3.select("#country").text("Country: " + d.Country);
    }

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/ 2},${height/ 2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")

    let node_elements = main_group.append("g")
        .attr('transform',`translate(${width/ 2},${height/2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class",function(d){
                return d.Country})

        .on ("mouseover",function (d,data){
            //make sure all items are inactive now
            node_elements.classed("inactive",true);
            // get the class of the hovered element
            const selected_class = d3.select(this).attr("class").split(" ")[0];
            // make all the hovered elements class active
            d3.selectAll("."+selected_class)
                .classed("inactive",false);

        })
        .on ("mouseout",function(d,data){
            d3.select("#Paper_Title").text("");
            d3.selectAll(".inactive").classed("inactive",false);
        })

    // Attach event listener to node elements for mouse click
        .on("click", function (event, d) {
        showAuthorDetails(d);
    });

    node_elements.append("circle")
        .attr("r",function(d,i){

            if (node_degree[d.id]!==undefined){
                return scale_radius(node_degree[d.id]);
            }
            else{
                return scale_radius(0);
            }
        })
        .attr("fill",function(d,i){
            return color(d.Country);
        })

    // Force Simulation
    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d,i){
                return scale_radius(node_degree[d.id])*1.2}))
        .force("x",d3.forceX())
        .force("y",d3.forceY())
        .force("charge",d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(function(d){
                return d.id})
        )
        .on ("tick",ticked);
    function ticked()
    {
        node_elements
            .attr('transform',function(d){return `translate(${d.x},${d.y})` })
        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})
    }
    svg.call(d3.zoom()
        .extent([[0,0], [width,height]])
        .scaleExtent([1,6])
        .on("zoom",zoomed));

    function zoomed({transform}){
        main_group.attr("transform",transform);
    }

    node_elements.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active && simulation.alpha() < 0.01) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

}
