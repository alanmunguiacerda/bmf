const COSTS = {
    PIROLO: [1.5, 0.3, 1, 2.5],
    BOMBO: [1, 2.5, 1.5, 0.3],
    LUCAS: [0.3, 1.5, 2.5, 1]
}

function randomMove(graph, agent, visited){
    if(!graph[agent]){
        console.log('ERROR, no hay ' + agent);
        return null;
    }
    let posX = graph[agent].x;
    let posY = graph[agent].y;
    let around = [[posX+1, posY], [posX-1, posY], [posX, posY+1], [posX, posY-1]
                , [posX+1, posY+1], [posX+1, posY-1], [posX-1, posY+1], [posX-1, posY-1]];
    let possibles = []
    let minVisited = null;
    let minFound;
    $.each(around, (i, tile) => {
        let key = tile[1]+','+tile[0];
        if (key in graph && graph[key]['type'] != TILES.WALL){
            if(!visited[key]){
                possibles.push({'x': tile[0], 'y': tile[1]});
            }else{
                if(visited[key] < minVisited || !minVisited){
                    minVisited = visited[key];
                    minFound = key;
                }
            }
        }
    });

    if(!possibles && !minFound){
        console.log("FATAL ERROR");
        return [];
    }

    if(!possibles){
        console.log('VISITED: ' + minFound);
        let pos = minFound.split(',');
        return [{'x': pos[1], 'y': pos[0]}];
    }

    return possibles;
}

function move(graph, agent, moveType, visited={}){
    let possibles = moveType(graph, agent, visited);
    if(possibles.length < 1){
        return null;
    }

    let rand = Math.floor(Math.random() * possibles.length);
    graph[agent].x = possibles[rand].x;
    graph[agent].y = possibles[rand].y;
    return possibles[rand].y+','+possibles[rand].x;
}

function findPath(graph, agent, moveType){
    var housePos = graph['HOUSE'].y+','+graph['HOUSE'].x;
    var visited = {};
    var path = []
    visited[graph[agent].y+','+graph[agent].x] = 1;
    path.push(graph[agent].y+','+graph[agent].x);
    var exit = false;
    do{
        var newPos = move(graph, agent, moveType, visited);
        if(!newPos){
            newPos = move(graph, agent, moveType)
            if(!newPos){
                return null;
            }
        }else{
            if(!visited[newPos]){
                visited[newPos] = 0;
            }
            visited[newPos]++;
            path.push(newPos);
        }
    }while(!exit && newPos != housePos);
    return path;
}

function adjustNodeWeights(graph, agentsPaths){
    $.each(agentsPaths, (agent, paths) => {
        var agentMin = null;
        var agentMax = null;
        var agentProm = 0;
        $.each(paths, (i, path) => {
            var pathWeight = 0;

            $.each(path, (j, node) => {
                let type = graph[node]['type'];
                if (type == TILES.WALL){
                    alert('A WALL HAS BEEN TOUCH');
                }
                pathWeight += COSTS[agent][type];
            })

            pathWeight *= path.length;

            if(pathWeight < agentMin || !agentMin){
                agentMin = pathWeight;
            }
            if(pathWeight > agentMax || !agentMax){
                agentMax = pathWeight;
            }
            agentProm = (agentMin + agentMax)/2;
            var adjust = pathWeight - agentProm;

            $.each(path, (j, node) => {
                if(!graph[node]['weights'][agent]){
                    graph[node]['weights'][agent] = 0;
                }
                graph[node]['weights'][agent] += adjust;
            })
        })
    })
}

function greedyMove(graph, agent, visited){
    let posX = parseInt(graph[agent].x);
    let posY = parseInt(graph[agent].y);
    let around = [[posX+1, posY], [posX-1, posY], [posX, posY+1], [posX, posY-1]
                , [posX+1, posY+1], [posX+1, posY-1], [posX-1, posY+1], [posX-1, posY-1]];

    var minWeight = null;
    var minFound = null;
    var minVisitedWeight = null;
    var minVisitedFound = null;
    $.each(around, (i, tile) => {
        let key = tile[1]+','+tile[0];
        if (key in graph && graph[key]['type'] != TILES.WALL){
            if(!visited[key]){
                if(graph[key]['weights'][agent] < minWeight || minWeight === null){
                    minWeight = graph[key]['weights'][agent];
                    minFound = key;
                }
            }else{
                if(visited[key] < minVisitedWeight || minVisitedWeight === null){
                    minVisitedWeight = visited[key];
                    minVisitedFound = key;
                }
            }
        }
    });

    if(minFound){
        let pos = minFound.split(',');
        return [{'x': pos[1], 'y': pos[0]}];
    }

    if(minVisitedFound){
        let pos = minVisitedFound.split(',');
        return [{'x': pos[1], 'y': pos[0]}];
    }

    console.log('NO VISITED, NO NEW');
    return [];
}
