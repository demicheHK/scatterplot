/**
 * Created by tristanmaurel on 24/07/15.
 */

var svg = d3.select("body").append("svg");

var dataset2 = [];




//tableau de données à importer
var dataset = [];

d3.csv("scripts/qd.csv")
    .row(function(d) {
        if(isNaN(bac(d.bacplus)))return;
        return {naissance : +d.naissance, bacplus:bac(d.bacplus), uid:d.naissance+"|"+d.bacplus};
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

        //update();
        update2();
    });


/*

 function addNumber(toAdd) {
 this.nombre = toAdd;
 }

 /* var count = function (d){
 for (var )
 }

 update();
 });


 var comparer = function (a,b) {
 if (a.naissance === b.naissance && a.bacplus === b.bacplus )
 {
 return 1;
 }
 else
 {
 return 0;
 }
 }

 var compter = function (a) {
 var nombre=0
 for(var b=0;b=50;b++)
 {
 nombre = nombre + comparer(a,dataset[b]);
 }
 return nombre;
 }



 console.log(compter(dataset[1]));


 */
// Compteur brutal.


console.log('dataset',dataset);

function bac (s) {
    s = s.replace("BAC + ","");
    return +s;
}


function removeone(){
    dataset.pop();
}




//hauteur et largeur du scatter plot à revoir
var h=400;
var l=840;
svg.attr("width",l);
svg.attr("height",h);
//marge aux extrémités
var m = 80;



// ---------------------------------------------------UPDATE------------------------------------------------------------

function update()
{


    //                                   ----------échelles------------
    d3.selectAll(".axis").remove();
    var xScale = d3.scale.linear()
        .domain([d3.min(dataset2,function(d){return d.naissance;}),d3.max(dataset2,function(d){return d.naissance})])
        .range([m,l-m]);

    var max=d3.max(dataset2,function(d){return d.bacplus;});

    console.log(max);
    var yScale = d3.scale.linear()
        .domain([d3.min(dataset2,function(d){return d.bacplus;}),d3.max(dataset2,function(d){return d.bacplus;})]) //à transformer en [0,7] ?
        .range([h-m,m]);


    //                                      ----------axe et lignes--------
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.format("04d"));

    svg.append("g").attr("class","axis")
        .attr("transform", "translate(0," + (h - m+20) + ")")
        .text("Année de naissance")
        .call(xAxis);


    //Axes des ordonnées enlevé
    /*var yAxis = d3.svg.axis()
     .scale(yScale)
     .orient("left")
     .ticks(d3.max(dataset2,function(d){return d.bacplus;}));

     svg.append("g").attr("class","axis")
     .attr("transform", "translate(" + (m-20) + ",0)")
     .call(yAxis);

     */


    //Lignes
    var dat=[2,3,4,5];
    //dat=d3.range(2,6);
    console.log("ello",dat);
    var lines=svg.selectAll("line.h").data(dat);
    lines.enter()
        .append("line")
        .attr("class",'h')
        .attr("x1",m-10)
        .attr("y1",function (d) { return yScale(d);})
        .attr("x2",l-m+10)
        .attr("y2",function (d) { return yScale(d);})
        .attr("stroke-width",0.5)
        .attr("stroke","#eee");



    //----------------------cercles-----------------------

    var circles = svg.selectAll("circle").data(dataset2);

    circles.enter()
        .append("circle")
        .attr('stroke', 'teal')
        .attr('stroke-width', 0)
        .attr("cx", function (d) {
            var abs = (xScale(d.naissance));
            return abs;})
        .attr("cy", function (d,i) {
            var ord = (yScale(d.bacplus));
            return ord;
        })
        .attr("r", 3)
        .attr("class", "cercle")

        .on('mouseover', function (d,i) {
            //var a = xScale(d[0]);
            //var b = yScale(d[1]);
            console.log(d);
            d3.select(this).attr('stroke-width', 3)
            //ci-dessous : étiquette
            /*

             .append("text")
             .attr("x", function(d){return xScale(d[0]);})
             .attr("y", function(d){return yScale(d[1]);})
             .text(function(d, i) {
             return "Nombre d'adhérents : "  +d[2]+"\nAnnée de naissance : "+d[0]+"\nNiveau d'études : bac+"+d[1];
             });
             */
        })
        .on('mouseout', function (d) {
            d3.select(this).attr('stroke-width', 0);
        })
        .append("svg:title")
        .text(function (d, i) {
            return "Nombre d'adhérents : " + 1 + "\nAnnée de naissance : " + d.naissance + "\nNiveau d'études : bac+" + d.bacplus;
        })
    ;
}

/*circles.transition(100)
 .attr("r",function(d){return zScale(1);});



 circles.exit()
 .attr("r",function(d){return 0;})
 .remove();

 */




// ---------------------------------------------------UPDATE2-----------------------------------------------------------
function update2()
{
    console.log('update2()');

    d3.selectAll(".axis").remove();

    //Échelles
    var xScale = d3.scale.linear()
        .domain([d3.min(dataset2,function(d){return d.naissance;}),d3.max(dataset2,function(d){return d.naissance})])
        .range([m,l-m]);

    var max=d3.max(dataset2,function(d){return d.bacplus;});


    var yScale = d3.scale.linear()
        //.domain([0,d3.max(dataset2,function(d){return d.bacplus;})]) //à transformer en [0,7] ?
        .domain(d3.extent(dataset2,function(d){return d.bacplus;})) //à transformer en [0,7] ?
        .range([h-m,m]);


    var zScale = d3.scale.linear()
        .domain([0,d3.max(dataset2,function(d){return d.n;})])
        .range([2,15]);


    //axes du scatter plot
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.format("04d")); //enlever la virgule

    svg.append("g").attr("class","axis")
        .attr("transform", "translate(0," + (h - m+20) + ")")
        .text("Année de naissance")
        .call(xAxis);

    /*

     var yAxis = d3.svg.axis()
     .scale(yScale)
     .orient("left")
     .ticks(d3.max(dataset2,function(d){return d.bacplus;}));

     svg.append("g").attr("class","axis")
     .attr("transform", "translate(" + (m-20) + ",0)")
     .call(yAxis);

     */


    //Lignes
    var dat=[2,3,4,5];
    //dat=d3.range(2,6);
    console.log("ello",dat);
    var lines=svg.selectAll("line.h").data(dat);
    lines.enter()
        .append("line")
        .attr("class",'h')
        .attr("x1",0)
        .attr("y1",function (d) { return yScale(d);})
        .attr("x2",1000)
        .attr("y2",function (d) { return yScale(d);})
        .attr("stroke-width",1)
        .attr("stroke","#eee");


    var circles = svg.selectAll("circle").data(dataset2);


    //cercles
    circles.enter()
        .append("circle")
        .attr('stroke','teal')
        .attr('stroke-width',0)
        .attr("cx",function(d){return xScale(d.naissance);})
        .attr("cy",function(d){
            return yScale(d.bacplus);})
        .attr("r",function(d){return zScale(d.n);})
        .attr("class","cercle")

        .on('mouseover',function(d){
            //var a = xScale(d[0]);
            //var b = yScale(d[1]);
            console.log(d);
            d3.select(this).attr('stroke-width',3)  //à faire fonctionner
            /*
             .append("text")
             .attr("x", function(d){return xScale(d[0]);})
             .attr("y", function(d){return yScale(d[1]);})
             .text(function(d, i) {
             return "Nombre d'adhérents : "  +d[2]+"\nAnnée de naissance : "+d[0]+"\nNiveau d'études : bac+"+d[1];
             });
             */
        })
        .on('mouseout',function(d){
            d3.select(this).attr('stroke-width',0);
        })
        .append("svg:title")
        .text(function(d, i) { return "Nombre d'adhérents : "+ d.n +"\nAnnée de naissance : "+ d.naissance+"\nNiveau d'études : bac+"+ d.bacplus;})
    ;



    var groups=svg.selectAll("g.groups").data(dataset2)
            .enter()
            .append('g').attr('class','groups')
            .attr("transform",function(d){return 'translate('+xScale(d.naissance)+','+yScale(d.bacplus)+')';})
            .data([1,2,3])
            .enter()
            .append('circle').attr('class','peep')
            .attr("cx",0)
            .attr("cy",function(d,i){return i*2;})
            .attr("r",2)
        ;


    /*
     groups.data()
     .enter()
     .append("circle")
     .attr("cx",0)
     .attr("cy",function(d,i){return i*2;})
     .attr("r",2);
     */
    /*circles.transition(100)
     .attr("r",function(d){return zScale(1);});



     circles.exit()
     .attr("r",function(d){return 0;})
     .remove();

     */

}