const container = document.querySelector(".container");
const addNodeBtn = document.querySelector(".add-node")
const addEdgeBtn = document.querySelector(".add-edge");
const clearGraphBtn = document.querySelector(".clear-graph");
const bfsBtn = document.querySelector(".bfs");
const dfsBtn = document.querySelector(".dfs");
const instruction = document.querySelector(".instruction");
const clearVisited = document.querySelector(".clear-visited");

//global variables
const nodes = [];
const edges = []
let isEdgeDrawing = false;
const adjList = new Map();
let currElementDraw = "";
let startNode;
let isAlgoRunning  = false;


const graphConfig = {
  edges:{
   color:"red",
   thickness:"3px",
  },
  nodes:{
    colorDefault:"aquamarine",
    colorVisited:"red",
    size:"40px"
  }
}




//event listeners
container.addEventListener("mousemove", mouseMove);
container.addEventListener("mousedown", mouseDown);
addNodeBtn.addEventListener("click", (ev) => {
  if(isAlgoRunning) return;
  instruction.innerText = "Click on the below screen to add nodes"
  currElementDraw = "node"
})
addEdgeBtn.addEventListener("click", (ev) => {
  if(isAlgoRunning) return;
   addEventListenerOnNodes();
  instruction.innerText = "Double click on a node and move the edge to the target node"
  currElementDraw = "edge"
})


dfsBtn.addEventListener("click", dfsHandler);
bfsBtn.addEventListener("click",bfsHandler);


clearGraphBtn.addEventListener("click",reset)
clearVisited.addEventListener("click",clearVisitedNodes)




//functions
function mouseDown(ev) {
  if (currElementDraw === "node") {
    nodeCreate(ev);
  }
}


function mouseMove(ev) {
  if (currElementDraw === "edge") {
      drawEdge(ev);
  }
}

function nodeCreate(ev) {
  const nodeDiv = document.createElement("div");
  container.appendChild(nodeDiv);
  adjList.set(nodeDiv, []);
  nodeDiv.classList.add("node");
   nodeInit(nodeDiv);
  const [cursorX, cursorY] = getPos(ev.clientX, ev.clientY);
  const containerRect = container.getBoundingClientRect();
  const { width } = nodeDiv.getBoundingClientRect();
  if (cursorY + width >= containerRect.height) {
    nodeDiv.style.top = `${containerRect.height - width}px`;
  }

  else {
    nodeDiv.style.top = cursorY + "px";
  }

  if (cursorX + width >= containerRect.width) {
    nodeDiv.style.left = `${containerRect.width - width}px`;
  }

  else {
    nodeDiv.style.left = cursorX + "px";
  }
  nodeDiv.innerText = `${nodes.length + 1}`;
  nodes.push(nodeDiv);
}


function startDrawingEdge(ev) {
  if (currElementDraw !== "edge" || isEdgeDrawing) return;
  startNode = ev.target;
  const [sx, sy] = getCenter(ev.target);
 
  const edgeDiv = document.createElement("div");
  edgeInit(edgeDiv);
  edgeDiv.classList.add("edge");
  edgeDiv.style.left = `${sx}px`;
  edgeDiv.style.top = `${sy}px`;
  container.appendChild(edgeDiv);
  edges.push(edgeDiv);
  isEdgeDrawing = true;
}

function drawEdge(event) {
  if (!isEdgeDrawing) return;

  const currentedge = edges[edges.length - 1];
  const containerRect = container.getBoundingClientRect();
  const deltaX = event.clientX - containerRect.left - parseFloat(currentedge.style.left);
  const deltaY = event.clientY - containerRect.top - parseFloat(currentedge.style.top);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  currentedge.style.transform = `rotate(${angle}deg)`;
  currentedge.style.width = `${length}px`;
}

function stopDrawingEdge(ev) {

  if (currElementDraw !== "edge" || !isEdgeDrawing) return;
  if (startNode === ev.target) return;
  isEdgeDrawing = false;
  const curredge = edges[edges.length - 1];
  const [sx, sy] = getCenter(startNode);
  const [fx, fy] = getCenter(ev.target);
  const finalLength = Math.sqrt((sx - fx) ** 2 + (sy - fy) ** 2);
  curredge.style.width = `${finalLength}px`;
  const deltaX = fx - sx;
  const deltaY = fy - sy;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  curredge.style.transform = `rotate(${angle}deg)`;
  addInMap(startNode, ev.target);
  addInMap(ev.target, startNode);

}

function addInMap(key, element) {
  if (!adjList.has(key)) {
    adjList.set(key, []);
  }

  adjList.get(key).push(element);
}


async function solveDfs(src, vis) {
  src.style.backgroundColor = graphConfig.nodes.colorVisited;
  vis.set(src, true);
  for (let child of adjList.get(src)) {
    if (!vis.has(child)) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Introduce a delay using async/await
      await solveDfs(child, vis)
    }
  }
}

function dfs() {
 
  instruction.innerText = ""
  const vis = new Map();
  return new Promise(async (resolve,reject)=>{
    try{
      await solveDfs(nodes[0],vis);
      resolve("Dfs completed");
    }
    catch(err){
      reject(err);
    }
    
})
}

async function solveBfs() {
  const vis = new Map();

  let q = [];
  q.push(nodes[0]);
  vis.set(nodes[0], true);
  while (q.length) {
    let levelSize = q.length;

    while (levelSize--) {
      const front = q.shift();
      front.style.backgroundColor = graphConfig.nodes.colorVisited;
      for (let child of adjList.get(front)) {
        if (!vis.has(child)) {
          q.push(child);
          vis.set(child, true)
        }
      }

    }
    await new Promise(resolve => setTimeout(resolve, 2000)); // Introduce a delay using async/await
  }
}

function bfs() {
 
  instruction.innerText = ""
  return new Promise(async (resolve,reject)=>{
      try{
        await solveBfs();
        resolve("Bfs completed");
      }
      catch(err){
        reject(err);
      }
      
  })
}

function getPos(x, y) {
  const containerRect = container.getBoundingClientRect();
  return [
    x - containerRect.left,
    y - containerRect.top
  ]
}

function clearGraph() {
  instruction.innerText = ""
  while (nodes.length) {
    container.removeChild(nodes.pop());
  }

  while (edges.length) {
    container.removeChild(edges.pop());
  }

  adjList.clear();
}

function addEventListenerOnNodes() {
  nodes.forEach((node) => {
    node.addEventListener("mouseover", stopDrawingEdge)
    node.addEventListener("mousedown", startDrawingEdge)
  });

}

function getCenter(node) {
  const nodeRect = node.getBoundingClientRect()
  const radius = nodeRect.width / 2;
  const [x, y] = getPos(nodeRect.left, nodeRect.top);
  return [x + radius, y + radius];
}

function clearVisitedNodes(ev){

  nodes.forEach((node)=>{
    node.style.backgroundColor = graphConfig.nodes.colorDefault;
  })
  clearVisited.style.display = "none";
  bfsBtn.style.display = "inline-block";
  dfsBtn.style.display = "inline-block";
}

function nodeInit(node){
  node.style.backgroundColor = graphConfig.nodes.colorDefault;
  node.style.width = graphConfig.nodes.size;
  node.style.height = graphConfig.nodes.size;
}


function edgeInit(edge){
edge.style.backgroundColor = graphConfig.edges.color;
edge.style.height = graphConfig.edges.thickness;
}

function reset(){
  clearGraph();
  currElementDraw = "";
  isEdgeDrawing = false;
  isAlgoRunning = false;
  startNode = null;
  bfsBtn.innerText = "Bfs";
  dfsBtn.innerText = "Dfs";
  clearVisited.style.display = "none";
}

function dfsHandler(ev){
  if(isAlgoRunning) return;


   if(nodes.length==0){
     return;
   }


  isAlgoRunning = true;
  ev.target.innerText = "Dfs running..."
  dfs().then((msg)=>{
    ev.target.innerText = "Dfs";
    bfsBtn.style.display = "none"
    dfsBtn.style.display = "none"
    clearVisited.style.display = "inline-block";
    isAlgoRunning = false
    
  }).catch((err)=>{
     //erorr
  })

}

function bfsHandler(ev){
  if(isAlgoRunning) return;
  if(nodes.length==0){
    return;
  }
  isAlgoRunning = true;
  ev.target.innerText = "Bfs running..."
  bfs().then((msg)=>{
    ev.target.innerText = "Bfs";
    bfsBtn.style.display = "none"
    dfsBtn.style.display = "none"
    clearVisited.style.display = "inline-block"
    isAlgoRunning = false
  }).catch((err)=>{
    //erorr
  })
}
