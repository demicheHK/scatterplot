/**
 * Created by tristanmaurel on 24/07/15.
 */


var svg = d3.select("#graph").append("svg");

var dataset2 = [];




//tableau de données à importer
var dataset = [];

//d.sexe=Math.floor(Math.random()*2);
//
//d3.csv("scripts/qd.csv")
d3.csv("scripts/questionnaire.csv")
    .row(function(d, i) {
        if(isNaN(bac(d["Quel est votre niveau de formation académique ?"])))return;
        if(d['Quelle est votre année de naissance ?']<1895)return;
        var obj={
            naissance: d['Quelle est votre année de naissance ?'],
            sexe:Math.floor(Math.random()*3),
            bacplus:bac(d["Quel est votre niveau de formation académique ?"]),
            pays: d['Quel est votre pays de résidence ?'],
            statut : d["Quel est votre statut professionnel ?"],
            formation : d['Quelle est votre formation ?'],
            inscription : d['Etes-vous inscrit à titre personnel ou par votre entreprise ?'],
            finance : d['Exercez-vous un métier directement dans la finance ?'],
            uid:d['Quelle est votre année de naissance ?']+"|"+d["Quel est votre niveau de formation académique ?"]
        };
        return obj;
    })
    .get(function(error, rows) {
        dataset=rows;
        dataset2 = d3.nest()
            .key(function(d){return d.uid;})
            .entries(dataset);

        $.each(dataset2,function(i,d){
            d.naissance=+d.key.split('|')[0];
            d.bacplus=bac(d.key.split('|')[1]);
            d.n=d.values.length;
        });
        affichePays();
        d3.selectAll('input.checkbox').attr('checked','true');
        $('input').change(function(){update2()});
        update2();
    });



//var color=d3.color();
var color=d3.scale.category10();






function bac (s) {
    s = s.replace("BAC + ","");
    return +s;
}


function removeone(){
    dataset.pop();
}



//nombre en couleur à côté des pays


function listePays(a) {
    var counts = {};
    a.forEach(function (d) {
        if (!counts[d.pays]) {
            counts[d.pays] = 0;
        }
        counts[d.pays]++;
    });
    return counts;
};

function affichePays() {
    var listedePays = listePays(dataset);
    var blocHTML = "";

   for (var k in listedePays) {
       blocHTML = blocHTML + "<label for=\"" + k + "\" style='font-weight: normal'><input type=checkbox class=checkbox id=\"" + k + "\"> &nbsp " + k + " <span style='color: " + color(k) + "'><strong> " + listedePays[k] + " </strong></span></label><br>";
   };

    $("#pays").html(blocHTML);
};



// ---------------------------------------------------UPDATE2-----------------------------------------------------------
function update2() {

    svg.selectAll('*').remove();

    var h=300;
    var l=$('.container').width();
    svg.attr("width",l);
    svg.attr("height",h);
//marge aux extrémités
    var m = 80;


    d3.selectAll(".axis").remove();

    l = $('.container').width();
    svg.attr("width", l);

    //Échelles
    var xScale = d3.scale.linear()
        .domain([d3.min(dataset2, function (d) {
            return d.naissance;
        }), d3.max(dataset2, function (d) {
            return d.naissance
        })])
        .range([80, l - 10]);

    var max = d3.max(dataset2, function (d) {
        return d.bacplus;
    });


    var yScale = d3.scale.linear()
        //.domain([0,d3.max(dataset2,function(d){return d.bacplus;})]) //à transformer en [0,7] ?
        .domain(d3.extent(dataset2, function (d) {
            return d.bacplus;
        })) //à transformer en [0,7] ?
        .range([h - 50, 50]);


    var zScale = d3.scale.linear()
        .domain([0, d3.max(dataset2, function (d) {
            return d.n;
        })])
        .range([0, 15]);


    //---------------------axes-----------------------------
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")

        .tickFormat(d3.format("04d")); //enlever la virgule

    svg.append("g").attr("class", "axis")
        .attr("transform", "translate(0," + (h - 20) + ")")
        .text("Année de naissance")
        .call(xAxis)
        .attr("margin-top", 10);


    //--------------------------------------Lignes-----------------------------
    //var dat = [ 1, 2, 3, 4, 5, 6, 7];
        var min = d3.min(dataset2, function (d) {
            return d.bacplus;
        });
        var max = d3.max(dataset2, function (d) {
            return d.bacplus;
        });
        var dat = d3.range(min, max + 1);
        var lines = svg.selectAll("line.h").data(dat)
        lines.enter()
            .append("line")
            .attr("class", 'h')
            .attr("x1", 60)
            .attr("y1", function (d) {
                return yScale(d);
            })
            .attr("x2", l)
            .attr("y2", function (d) {
                return yScale(d);
            })
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.4);

        //Légende
        var legend = svg.selectAll("text.t")
            .data(dat)
            .enter()
            .append("text")
            .attr("class", "t")
            .attr("x", (5))
            .attr("y", function (d) {
                return yScale(d);
            })
            .attr("text-anchor", "left")
            .style("font-size", "12px")
            .style("text-decoration", "none")
            .text(function (d) {
                return "Bac +" + d;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "4px")
            .attr("fill", "dark")
            .attr("opacity", 0.6);

    d3.selectAll("g.groups,circle").remove();

    if ($('input[name=options]:checked').attr('id') == "option1") {

        $("#propriétés").addClass("hide");
        $("#color").removeClass("hide");


        var groups = svg.selectAll("g.groups").data(dataset2)
                .enter()

                .append('g').attr('class', 'groups')
                .attr("transform", function (d) {
                    return 'translate(' + xScale(d.naissance) + ',' + yScale(d.bacplus) + ')';
                })
                .selectAll("circle.peep")
                .data(function (d) {
                    return d.values
                })
                .enter()

                .append('circle').attr('class', 'peep')
                .filter(function (d) {
                    var checks = $('#pays input.checkbox:checked');
                    for (var i = 0; i < checks.length; i++) {
                        //var id=checks[i].id;
                        if (checks[i].id == d.pays)return true;
                    }
                })

                .filter(function (d) {
                    var checks = $('#sexe input.checkbox:checked');
                    for (var i = 0; i < checks.length; i++) {
                        //var id=checks[i].id;
                        if (checks[i].id == 'Homme' && d.sexe == 1)return true;
                        if (checks[i].id == 'Femme' && d.sexe == 2)return true;
                        if (checks[i].id == 'Autre' && d.sexe == 0)return true;
                    }
                })


                .filter(function (d) {
                    var checks = $('#finance input.checkbox:checked');
                    for (var i = 0; i < checks.length; i++) {
                        if (checks[i].id == d.finance)return true;
                    }

                })

                .filter(function (d) {
                    var checks = $('#statut input.checkbox:checked');
                    for (var i = 0; i < checks.length; i++) {
                        //var id=checks[i].id;
                        if (checks[i].id == d.statut)return true;
                    }
                })


                .attr("cx", 0).attr("cy", function (d, i) {
                    return i * -7;
                }).attr("r", 3)
                .attr('stroke-width', 0)
                .attr("fill", function (d) {
                    if ($('input[name=colorbtn]:checked').attr('id') == "option4") {
                        return color(d.pays);
                    }
                    if ($('input[name=colorbtn]:checked').attr('id') == "option5") {
                        return color(d.finance);
                    }
                    if ($('input[name=colorbtn]:checked').attr('id') == "option6") {
                        return color(d.sexe);
                    }
                    if ($('input[name=colorbtn]:checked').attr('id') == "option7") {
                        return color(d.statut);
                    }

                })
                /*.on('mouseover', function (d) {
                    d3.select(this).attr('stroke-width', 3)
                        .attr("fill", function (d) {
                            return color(d.pays);
                        })
                        .attr("stroke", function (d) {
                            return color(d.pays);
                        })
                })
                .on('mouseout', function (d) {
                    d3.select(this).attr('stroke-width', 0);
                    d3.select(this).attr("fill", function (d) {
                        return color(d.pays);
                    })
                })*/
                .append("svg:title")
                .text(function (d, i) {
                    return "Année de naissance : " + d.naissance + "\nNiveau d'études : bac+" + d.bacplus + "\nPays d'origine : " + d.pays;
                })


            ;


    } if ($('input[name=options]:checked').attr('id') == "option2") {
        $("#color").addClass("hide");
        $("#propriétés").addClass("hide");

        var circles = svg.selectAll("circle.blue").data(dataset2);

        circles.enter().append("circle").attr("class", 'blue')

            .attr('stroke-width', 0)
            .attr("cx", function (d) {
                return xScale(d.naissance);
            })
            .attr("cy", function (d) {
                return yScale(d.bacplus);
            })
            .attr("r", function (d) {


                //filtrer ici


                var v = d.values.filter(function (d) {
                    var checks = $('#finance input.checkbox:checked');
                    for (var i = 0; i < checks.length; i++) {
                        if (checks[i].id == d.finance)return true;
                    }
                    return false;
                })


                    .filter(function (d) {
                        var checks = $('#pays input.checkbox:checked');
                        for (var i = 0; i < checks.length; i++) {
                            //var id=checks[i].id;
                            if (checks[i].id == d.pays)return true;
                        }
                    })

                    .filter(function (d) {
                        var checks = $('#statut input.checkbox:checked');
                        for (var i = 0; i < checks.length; i++) {
                            //var id=checks[i].id;
                            if (checks[i].id == d.statut)return true;
                        }
                    })

                    .filter(function (d) {
                        var checks = $('#sexe input.checkbox:checked');
                        for (var i = 0; i < checks.length; i++) {
                            //var id=checks[i].id;
                            if (checks[i].id == 'Homme' && d.sexe == 1)return true;
                            if (checks[i].id == 'Femme' && d.sexe == 2)return true;
                            if (checks[i].id == 'Autre' && d.sexe == 0)return true;
                        }
                    })
                return zScale(v.length);
            })

            .attr("fill", "#c00")
            .attr('opacity', 0.6)
            .on('mouseover', function (d) {
                //var a = xScale(d[0]);
                //var b = yScale(d[1]);
                d3.select(this).attr('stroke-width', 3)  //à faire fonctionner

            })
            .on('mouseout', function (d) {
                d3.select(this).attr('stroke-width', 0);
            })
            .append("svg:title")
            .text(function (d, i) {
                return "Nombre d'adhérents : " + d.n + "\nAnnée de naissance : " + d.naissance + "\nNiveau d'études : bac+" + d.bacplus;
            });


        circles.exit().remove();


    }if ($('input[name=options]:checked').attr('id') == "option3") {
        $("#color").addClass("hide");
        $("#propriétés").removeClass("hide");
        updateBubble();

    }


}

function updateBubble () {
    console.log('updateBubble ()',dataset.length);
    svg.selectAll('*').remove();

    var diameter = svg.attr("height"),
        format = d3.format(",d"),
        color = d3.scale.category20();


    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    //d3.json("scripts/package.json", function(error, root) {
    //    if (error) throw error;

    var root={};

    var data = d3.nest()
        .key(function(d){
            var id=$('input[name=Option]:checked').attr('id');
            console.log('input checked id=',id);
            if (id == "property1") {
                return d.pays;
            }

            if (id == "property2") {
                return d.formation;
            }

            if (id == "property3") {
                if (d.sexe==0){
                    return "Homme";
                }
                if (d.sexe==1){
                    return "Femme";
                }
                if (d.sexe==2){
                    return "Autre";
                }
            }

            if (id == "property4") {
                return d.statut;
            }

            console.log("truc qui merde :",id);

            ;})
        .entries(dataset);

    // modifier 'root' pour lui ajouter la propriete size
    // parcourir le tableau root; et ajouter la propriete size a chaque element du tableau

    for (var i=0; i<data.length; i++){
        data[i].size=data[i].values.length;
        data[i].name=data[i].key;
        delete data[i].values;
        delete data[i].key;
        console.log('size', data[i].size);
    };

    console.log('data',data);
    if (data.length==0){
        console.log("c la merde");
        return;
    }
    root = {"children": data};

    var datahuit=classes(root);

        var node = svg.selectAll(".node")
            .data(bubble.nodes(datahuit)
                .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.className); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r); });
    //});


    // Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
        var classes = [];

        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
        }

        recurse(null, root);
        return {children: classes};
    }


    //d3.select(self.frameElement).style("height", diameter + "px");

}




$(document).ready(function(){
    $(window).resize(function(){
        var hauteur = $(window).height();
        var largeur = $(window).width();
        console.log("hauteur="+hauteur,"largeur="+largeur);
        var h=300;
        var l=$('.container').width()-240;
        svg.attr("width",l);
        svg.attr("height",h);
        update2();
    })
})