const agents = ['PIROLO', 'BOMBO', 'LUCAS'];
var graph = {};

$(document).ready(function() {
    $('#randomize_map').click(randomizeMap);
    $('#reset_map').click(resetMap);
    $('#start_training').click(train);
    $('#start_greedy').click(findGreedyPath);
});

function randomizeMap(){
    let ids = ['plain_per', 'water_per', 'mountain_per', 'ravine_per', 'wall_per']
    let percents = {};
    let sum = 0;
    let adjust = 0;

    ids.map(id => {
        let val = parseInt($('#' + id).val());
        percents[id] = val;
        sum += val;
    });

    if(sum < 100) sum = 100;

    adjust = 100/sum;
    $.map(percents, (item, i) => {
        percents[i] = item * adjust;
    })

}

function train(){
    var paths = {}
    graph = mapToGraph();
    var iterations = parseInt($('#iterations').val());

    if (!graph['HOUSE']){
        console.log('YOU NEED A HOUSE');
        return;
    }

    $.each(agents, (index, agent) => {
        if(!graph[agent]){
            console.log(agent+' NOT FOUND');
            return;
        }
        var startX = graph[agent].x;
        var startY = graph[agent].y;
        paths[agent] = [];
        for(let i=0; i<iterations; i++){
            var path = findPath(graph, agent, randomMove);
            if(path){
                checkPath(path, startX, startY);
                paths[agent].push(path);
            }
            graph[agent].x = startX;
            graph[agent].y = startY;
        }
    });

    adjustNodeWeights(graph, paths);
    console.log('TRAINING COMPLETE');
}

function checkPath(path, x, y){
    var housePos = graph['HOUSE'].y+','+graph['HOUSE'].x;
    if (path[0] != y+','+x){
        console.log('WRONG START');
    }

    if(path[path.length-1] != housePos){
        console.log('WRONG END');
    }
}

function findGreedyPath(){
    var greedyPaths = {}
    $.each(agents, (i, agent) => {
        if(!graph[agent]){
            console.log(agent+' NOT FOUND');
            return;
        }
        var startX = graph[agent].x;
        var startY = graph[agent].y;
        greedyPaths[agent] = findPath(graph, agent, greedyMove);
        checkPath(greedyPaths[agent], startX, startY);
        graph[agent].x = startX;
        graph[agent].y = startY;
    });

    $.each(agents, (i, agent) => {
        if(!greedyPaths[agent]){
            return;
        }
        console.log(agent + ' PATH: ' + greedyPaths[agent].length + ' nodes');
        var index = 0;
        var interval = setInterval(() => {
            if(index == greedyPaths[agent].length){
                console.log(agent, ' ARRIVED HOME');
                clearInterval(interval);
                return;
            }
            var next = greedyPaths[agent][index].split(',');
            moveAgent(next[1], next[0], agent);
            index++;
        }, 500);
    });
}
