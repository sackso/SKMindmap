const mindmapData = {
    name: "Main Node",
    children: [
        { name: "Child Node 1" },
        { name: "Child Node 2", children: [{ name: "Grandchild Node 1" }] },
    ],
};

const svg = d3.select("#mindmap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

const mindmapLayout = d3.tree().size([800, 600]);

const root = d3.hierarchy(mindmapData);
const treeData = mindmapLayout(root);

const link = svg.selectAll(".link")
    .data(treeData.links())
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

const node = svg.selectAll(".node")
    .data(treeData.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .on("click", editNodeText);

node.append("circle")
    .attr("r", 4.5);

node.append("text")
    .attr("dy", 3)
    .attr("x", d => d.children ? -8 : 8)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

// Add a new node when pressing Enter key on the focused node's text
$(".node text").on("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const nodeElement = $(this).parent();
        const nodeData = nodeElement.data()[0].data;
        addNode(nodeData);
    }
});

function addNode(nodeData) {
    const newNode = { name: "New Node" };
    if (!nodeData.children) nodeData.children = [];
    nodeData.children.push(newNode);
    updateMindmap();
}

function updateMindmap() {
    const treeData = mindmapLayout(root);

    // Update links
    svg.selectAll(".link")
        .data(treeData.links())
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Update nodes
    const node = svg.selectAll(".node")
        .data(treeData.descendants())
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Enter new nodes
    const newNode = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    newNode.append("circle")
        .attr("r", 4.5);

    newNode.append("text")
        .attr("dy", 3)
        .attr("x", d => d.children ? -8 : 8)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);

    // Remove old nodes
    node.exit().remove();
}


function editNodeText(d) {
    const nodeElement = d3.select(this);
    const textElement = nodeElement.select("text");
    textElement.attr("contentEditable", true);
    textElement.node().focus();

    textElement.on("blur", function() {
        const editedText = $(this).text();
        d.data.name = editedText;
        textElement.attr("contentEditable", null);
    });

    // Prevent click event propagation to the svg element
    d3.event.stopPropagation();
}