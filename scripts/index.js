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
        //console.log(d);
        console.log(d['Quelle est votre année de naissance ?']);
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
        //console.log(rows);
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





console.log('dataset',dataset);

function bac (s) {
    s = s.replace("BAC + ","");
    return +s;
}


function removeone(){
    dataset.pop();
}




//hauteur et largeur du scatter plot à revoir
var h=300;
var l=$('.container').width();
svg.attr("width",l);
svg.attr("height",h);
//marge aux extrémités
var m = 80;




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
    console.log(listedePays);
    var blocHTML = "";

   for (var k in listedePays) {
       console.log(k,listedePays[k]);
       blocHTML = blocHTML + "<label for=\"" + k + "\" style='font-weight: normal'><input type=checkbox class=checkbox id=\"" + k + "\"> &nbsp " + k + " <span style='color: " + color(k) + "'><strong> " + listedePays[k] + " </strong></span></label><br>";
   };

    $("#pays").html(blocHTML);
};



function listeFinance(a) {
    var counts = {};
    a.forEach(function (d) {
        if (!counts[d.finance]) {
            counts[d.finance] = 0;
        }
        counts[d.finance]++;
    });
    return counts;
};

function afficheFinance() {
    var listedeFinance = listeFinance(dataset);
    console.log(listedeFinance);
    var blocHTML = "";

    for (var f in listedeFinance) {
        console.log(f,listedeFinance[f]);
        blocHTML = blocHTML + "<p><label for=" + f + " style='font-weight: normal'><input type=checkbox class=checkbox id=" + f + "> &nbsp " + f + " <span style='color: " + color(f) + "'><strong> " + listedeFinance[f] + " </strong></span></label></p>";
    };

    $("#finance").html(blocHTML);
};






// ---------------------------------------------------UPDATE2-----------------------------------------------------------
function update2() {
    console.log('update2()');

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


        var groups = svg.selectAll("g.groups").data(dataset2)
                .enter()

                .append('g').attr('class', 'groups')
                .attr("transform", function (d) {
                    return 'translate(' + xScale(d.naissance) + ',' + yScale(d.bacplus) + ')';
                })
                .selectAll("circle.peep")
                .data(function (d) {
                    //console.log(d)
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
                    if ($('input[name=Option]:checked').attr('id') == "option3") {
                        return color(d.pays);
                    }
                    if ($('input[name=Option]:checked').attr('id') == "option4") {
                        return color(d.finance);
                    }
                    if ($('input[name=Option]:checked').attr('id') == "option5") {
                        return color(d.sexe);
                    }
                    if ($('input[name=Option]:checked').attr('id') == "option6") {
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


    } else {


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

                //console.log('d.values',d.values)

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


    }


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