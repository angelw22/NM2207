require(
   // Use this library to "fix" some annoying things about Raphel paper and graphical elements:
    //     a) paper.put(relement) - to put an Element created by paper back on a paper after it has been removed
    //     b) call element.addEventListener(...) instead of element.node.addEventListener(...)
    ["../jslibs/raphael.lonce"],  // include a custom-built library

    function () {

        ///----------------------\\\
        //|                      |\\
        //|      Initialise      |\\
        //|                      |\\
        //\----------------------/\\

        // Grab the div where we will put our Raphael paper
        var centerDiv = document.getElementById("centerDiv");
        //console.log("height of div is " + centerDiv.offsetHeight);

        // Create the Raphael paper that we will use for drawing and creating graphical objects
        var paper = new Raphael(centerDiv);
        var score = 0;

        
        //console.log("height of the paper is " + paper.width);
        // put the width and heigth of the canvas into variables for our own convenience
        var pWidth = paper.width;
        var pHeight = paper.height;
        var end = false;
        var start = true;


        //AUDIO
        var a = 0;
        var b = 0;
        var bg = new Audio('audio/bg.mp3');

        function sound(x) {
            while (a < 2) {
                var zap = new Audio('audio/bounce.wav');
                var lose = new Audio('audio/lose.wav');
                
                a++;
            }

            if (x == "bounce") {
                zap.play();
                a--;
            }
            // else if (x == "bg") {
            //     bg.play();
            //     b--;
            // }
            else if (x == "lose") {
                lose.play()
                a--;

            }

        }
        bg.play()

        //Initialise the fill colour for restart button
        var restartfill = undefined;


        //Initialise the difficulty multiplier, default at 1
        var difficulty = 1

        //MENU INIT

        var Dbutton = document.getElementById('button')
        Dbutton.addEventListener("click", function() {
            console.log("clicked")
            if (difficulty == 3) {
                difficulty = 1
            }
            else {
                difficulty++
            }
            

            if (difficulty == 1) {
                Dbutton.value = "easy"
                Dbutton.style.background= "#4CAF50"
                
                console.log(difficulty)
            }
            if (difficulty == 2) {
                Dbutton.value = "medium";
                Dbutton.style.background= '#ff8c4f'
                console.log(difficulty)
            }
            if (difficulty == 3) {
                Dbutton.value = "hard"
                Dbutton.style.background= "#ff4f4f"
                console.log(difficulty)
            }
            

        })


        //INSTRUCTIONS INIT 
        var mouse = paper.image('img/cursor.png', (pWidth * 0.3), (pHeight * 0.7), 64, 64);
        var instr = paper.text(pWidth/2, pHeight *0.85, "Draw a platform for the rabbit\n and collect Hearts").attr({'font-size': '30px', 'font-family': 'Gaegu', 'fill': '#FFABCB'})

            mouse.x = pWidth * 0.3

        

        // if (localStorage.getItem(localStorage.getItem(1)) === null) {
        //     console.log("reset");
        //     localStorage.setItem(1, JSON.stringify(({"name": "AAA", "score": 500})));
        //     localStorage.setItem(2, JSON.stringify(({"name": "BBB", "score": 400})));
        //     localStorage.setItem(3, JSON.stringify(({"name": "CCC", "score": 300})));
        //     localStorage.setItem(4, JSON.stringify(({"name": "DDD", "score": 200})));
        //     localStorage.setItem(5, JSON.stringify(({"name": "EEE", "score": 100})));        
        // }

        function resetlocalst() {
            console.log("reset");
            localStorage.setItem(1, JSON.stringify(({"name": "AAA", "score": 500})));
            localStorage.setItem(2, JSON.stringify(({"name": "BBB", "score": 400})));
            localStorage.setItem(3, JSON.stringify(({"name": "CCC", "score": 300})));
            localStorage.setItem(4, JSON.stringify(({"name": "DDD", "score": 200})));
            localStorage.setItem(5, JSON.stringify(({"name": "EEE", "score": 100})));        
    
        }


        
        //Create array to store high scores
        var highscores = []
        //Initialise value for name, which is only asked for if there is a broken highscore
        var name = undefined;

        //while loop to update all the localstorage high score values, and set it to the main page.
        var i = 0;
        while (i < 5) {
            if (localStorage.getItem(localStorage.key(i)) === null) {
                console.log("hello i am null");
                resetlocalst();
            }
            else {
                highscores.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
                console.log(highscores);
                var nameidgen = "name" + i;
                var namescoregen = "score" + i;
                document.getElementById(nameidgen.toString()).innerHTML = highscores[i].name;
                document.getElementById(namescoregen.toString()).innerHTML = highscores[i].score;
                i++
            }
            
        }


        

        /////___---___---___\\\\\
        /////                \\\\
        ///(      CREATE     )\\\
        //(       CLOUD       )\\
        ///\      ACTION     /\\\
        /////--___----___---\\\\\

        //Array to hold clouds
        var clouds = []
        var activeclouds = 0;
        var cloudnumber = 10;
        

        //Random cloud number/type generator, choose between cloud pngs available
        function cloudgen() {
            var cloudnum = Math.floor(Math.random() * 2);
            var string = 'img/cloud' + cloudnum + '.png';
            return string;
        }

        //Spawn the clouds, produce clouds up till declared cloud number
        var cloudspawn = function() {
            while (clouds.length < cloudnumber) {
                var randomX = Math.floor(Math.random() * pWidth) + 1;
                var cloudurl = cloudgen();
                clouds.push(paper.image(cloudurl, randomX, 50, 60, 40));
                activeclouds ++;
            }
        }
        cloudspawn();

        //Run through number of clouds to intialise values
        var c = 0;
        while (c < (clouds.length)) {
            clouds[c].speed = (Math.random()/2)+0.01;
            clouds[c].cloudy = 50;
            //console.log("setting cloud y, x is " + c)
            c++;
        }


        ////     <3 <3   <3 <3 
        ///   <3      <3       <3 
        //   <3  Collectables  <3
        //    <3              <3
        //       <3        <3
        //         <3    <3
        //            <3


        var collectable = undefined
        var collectablepoints = 1000;

        //Spawns collectable, sets x (random) and y properties as a child of the collectable object.
        var spawnC = function() {
            collectable = paper.image("img/heart.png", 0, 0, 50, 50);
            collectable.x = Math.floor(Math.random() * (pWidth-25)) + 1;
            
            collectable.y = -50;
        };
        
        spawnC();


        ///--------------------\\\
        //|                    |\\
        //|      DRAW LINE     |\\
        //|____________________|\\
        //|++++++++++++++++++++|\\
        //\--------------------/\\
        

        //COORDINATE VARIABLES
        var x1 = 0;
        var x2 = pWidth;
        var y1 = pHeight-20;
        var y2 = pHeight-20;


        //Initialise line, which will be positioned at the bottom of the paper.
        var line = paper.path("M" + x1 + "," + y1 + "L" + x2 + "," + y2).attr({stroke: "white", "stroke-width" : 5, 'stroke-linecap': "round"});
  

        //Default line gradient is 0
        line.gradient = 0;

        //Check for whether mouse has been clicked
        var clicked = false;
        //Check for whether line has been drawn 
        var drawn = false;
        
        //Event listener for mouse down for drawing the line
        document.getElementById("centerDiv").addEventListener("mousedown", function(ev) {
            drawn = false;
            bounceHeight = undefined;
            //Remove previous line once the user decides to draw a new line
            line.node.remove();
            //Prevents retention of bounceheight generated by old line, while drawing new line
            //Removes end coordinates of previous line
            x2 = undefined;
            y2 = undefined; 
            //Sets start coordinates
            x1 = ev.offsetX;
            y1 = ev.offsetY;
            start = false
            clicked = true        
        })

        document.getElementById("centerDiv").addEventListener("mouseup", function(ev) {
            if (clicked == true) {
                //Sets end coordinates
                x2 = ev.offsetX;
                y2 = ev.offsetY;
                //Redraw the line - with updated variables
                redrawline();
                drawn = true;
                clicked = false;

            }    
        })


        var redrawline = function() {
            //If there is an existing line, remove it before redrawing 
            if (line.node) {
                line.node.remove();
            }
            
            //Check if the y coordinates are within the paper
            if (y1 <= pHeight || y2 <= pHeight) {
                //If the ball is in bounce or suspension state
                if (fall == false) {
                    //Make the line fall 
                    y1 += 0.5;
                    y2 += 0.5;
                    //Redraw line with new Y values
                    line = paper.path("M" + x1 + "," + y1 + "L" + x2 + "," + y2).attr({stroke: "white", "stroke-width" : 5});
                    //Reset the gradient
                    line.gradient = ((y2 -y1)/(x2 - x1));
                    //Get new c as in y = mx + c formula of the line
                    line.c = y2 - (line.gradient * x2)
                }                
            }
            //If the y coordinates go beyond the paper, remove the line and remove any bounce values
            else {
                line.node.remove();
                bounceHeight = undefined;

            }
        }

        ///------------\\\
        //| TEST SPACE |\\
        //\------------/\\
        

        //BUTTONS TO TEST
        // document.getElementById('go').addEventListener("click", function() { endgame()});
        // document.getElementById('stop').addEventListener("click", function() { location.reload()})
        

        

        ///------------------------\\\
        //     n___n                \\
        //    ( .  .)               \\
        //   o{     }    Character  \\
        //     +---+                \\
        //\-------------------------/\


        var characterArray = []
        var i = 0
        while (i < 13) {
            var characterurl = "img/character/" + i + ".png"
            characterArray.push(characterurl);
            //characterArray.push(paper.image(characterurl, 0, 0, 60, 65))
            i++
        }
        var activeurl = characterArray[0];

        var activeChar = paper.image(activeurl, pWidth/2, pHeight/2, 60, 60)

        xpos = pWidth/2;
        ypos = pHeight*0.3;
    

        //Set initialising variables of character
        var direction = 0.9;
        var directionx = 0;
        var fall = true;
        var bounceHeight = pHeight - 70;
        var fallHeight = pHeight*0.45
        var stallTimer = 0; 
        var dieanimtimer = 0;
        var diechar = undefined;
        
        var dieanim = function() {
            diechar = paper.image(activeurl, xpos, 0, 60, 60)
            diechar.y = 0;
        }
       


        var decreasePoint = fallHeight - (-4/0.05);
        var increasePoint = pHeight - ((4-direction)/0.05);

        var bounce = function() {
           

           var endgame = function () {
                end = true;
                sound('lose');
                activeChar.remove();
            }

            if (end == false) {
                if (start == true) {
                    
                    if (mouse.x < (pWidth *0.7)) {
                        mouse.x ++
                    }
                    else {
                        mouse.x = pWidth * 0.3
                    }
                    mouse.attr({'x': mouse.x})
                    //console.log("drawing")
                }
                else {
                    //console.log("removing")
                    instr.node.remove();
                    mouse.node.remove();
                    
                }
                     
            }
            
            if (end == false) {

                if (drawn == true) {
     
                    
                    score ++;
                    //Create a yval variable, which stores the y value that the ball would need to bounce from, based on line drawn.
                    var yval = undefined;             
                        //Check if disk's x position is between the line drawn
                        //& if character's x position is within the line's x pos

                    if ((y1 <= pHeight || y2 <= pHeight)&& xpos > x1 && xpos < x2 ) {
                        directionx = line.gradient * 3;
                        yval = (line.gradient*xpos) + line.c;    
                }
                else {
                    //if line is not drawn, bounceHeight is undefined
                    bounceHeight = undefined;
                }

                //Equate bounceheight to the y value, to tell the activeChar when to bounce. 
                //Set bounceheight to y val only if the character is above the y values of drawn line.
                if (ypos <= y1 || ypos <= y2) {
                    bounceHeight = yval - 60;
                }
                else {
                    //if not, the line's yvalue is not counted to be bounced
                    bounceheight = undefined;
                }            
            }
          
                //if character is falling
                if (fall == true) {
                    //Check if the ypos of the character reaches bounceheight
                    //If Change direction to -4 (creating a bounce effect)
                    //set fall = false
                    //change animation of character
                    if (ypos >= bounceHeight) {
                            sound("bounce");
                            direction = -4;
                            fall = false;
                            activeurl = characterArray[2];         
                    }
                    //else if the ball is in fact falling, and at a speed of less than 4, add 0.05 until it reaches 4
                    else if (direction <= 4) {
                        direction += 0.05
                    }

                }
                else {
                    if (ypos < decreasePoint) {
                        if (direction >= 0) {
                            if (stallTimer < 50) {
                                direction = 0;
                                activeurl = characterArray[3]
                                if (drawn == true) {
                                    var x = 0
                                    while (x < clouds.length) {
                                    clouds[x].cloudy += clouds[x].speed;
                                    clouds[x].attr({y: clouds[x].cloudy})
                                    x++;
                                    }
                                }  
                                stallTimer++;
                            }
                            else if (stallTimer = 50) {
                                direction += 0.05;
                                fall = true;
                                stallTimer = 0;

                            }           
                        }
                        else if (direction < 0){           
                            direction += 0.05;
                            // console.log("deducting here");
                        }   
                    }    
                }

                ypos += direction;
                if (ypos > (pHeight +50) && bounceHeight == undefined) {
                    end = true;
                    //endgameintv();
                }

                //if direction negative, means ball going upwards
                if (direction < 0 ) {
                    if (drawn == true) {
                        xpos += directionx;
                        var x = 0;
                        redrawline();
                        activeurl = characterArray[1];
                        while (x < clouds.length) {
                            clouds[x].cloudy += clouds[x].speed;
                            clouds[x].attr({y: clouds[x].cloudy})
                            x++;
                        }
                    }
                }
                //if direction positive, which means ball falling.
                if (direction > 0 ){
                    
                    var x = 0
                    activeurl = characterArray[4]
                    while (x < clouds.length) {
                        clouds[x].attr({y: clouds[x].cloudy})

                        if (clouds[x].cloudy > pHeight) {
                            clouds[x].cloudy = -20;
                            clouds[x].attr({x: (Math.floor(Math.random() * (pWidth -50)) + 1)}) ;
                            cloudspawn();
                        }
                        x++;
                    }
                }

                if (xpos <= 0 || xpos >= pWidth) {
                    directionx *= -1
                    console.log("changing directionx")
                }

                if (ypos <= (collectable.y + 40) && ypos >= (collectable.y - 40) && xpos <= (collectable.x + 40) && xpos >= (collectable.x -40)) {
                    collectable.remove();
                    score += 1000 * difficulty;
                    spawnC();
                }
                if (collectable.y > pHeight) {
                    collectable.remove()
                    spawnC();
                }

                activeChar.attr({'x': xpos, 'y':ypos, 'src':activeurl})
            

                collectable.y += (0.1 * (difficulty * 2))
                collectable.attr({'y': collectable.y, 'x':collectable.x})
                document.getElementById('score').innerHTML = score;

            }
            
            else {
                 
                var x = 0;
                activeChar.remove();
                if (collectable) {
                    collectable.remove()
                }
                if (line.node) {
                    line.node.remove();
                }
                while (x < clouds.length) {
                    clouds[x].cloudy -= 2;
                    clouds[x].attr({y: clouds[x].cloudy})
                    if (clouds[x].cloudy <= 0) {
                        clouds[x].remove();
                    }
                    x++;
                }
                if (diechar == undefined) {
                    dieanim();
                }
                else if (diechar.y < (pHeight - 60)) {
                    diechar.y += 1.5
                    if (diechar.y > (pHeight * 0.7)) {
                        activeurl = characterArray [6];
                    }
                }
                else {
                    if (dieanimtimer <= 50) {
                        activeurl = characterArray[7]
                    }
                    else if (dieanimtimer <= 110 && dieanimtimer > 50) {
                        activeurl = characterArray[8]
                    }
                    else if (dieanimtimer <= 140 && dieanimtimer >110) {
                        activeurl = characterArray[9]
                    }
                    else if (dieanimtimer <= 170 && dieanimtimer > 140) {
                        activeurl = characterArray[10]
                    }
                    else if (dieanimtimer <= 200 && dieanimtimer > 170) {
                        activeurl = characterArray[11]
                    }
                    else if (dieanimtimer <= 300 && dieanimtimer >200) {
                        activeurl = characterArray[12]
                    }
                    else {
                        activeurl = "img/tombstone.png"
                        var gameovertxt = paper.text((pWidth/2), (pHeight*0.4), "GAME OVER")
                        gameovertxt.attr({'font-size': '80px', 'font-family': 'Gaegu', 'fill': 'white'})
                        var restartbutton = paper.set();

                        
                        if (restartfill == undefined) {
                            restartfill = '#ffeaf2'
                        }
                        var restart = paper.rect((pWidth/2 - 75), ((pHeight*0.5)), 150, 50, 10);
                        var restarttx = paper.text((pWidth/2), ((pHeight*0.5) +25), "RESTART")
                        //var restartoverlay = paper.rect((pWidth/2 - 75), ((pHeight*0.5)), 150, 50, 10);
                        //restartoverlay.attr({'fill':'#fff','stroke-opacity' : 0, 'opacity':0});

                        restartbutton.push(restart);
                        restartbutton.push(restarttx);


                        restartbutton.mousedown(function(){
                            promptname();
                        })
                        restartbutton.mouseover(function(){ restartfill = 'white'; console.log('mouseing over')});

                        restartbutton.mouseout(function(){ restartfill = '#ffeaf2'})

                                                
                        restart.attr({'fill': restartfill, 'stroke-width': '4', 'stroke': 'white'})
                        restarttx.attr({'font-size': '35px', 'font-family': 'Gaegu', 'fill': '#FFABCB'})
     
                    }

                    //console.log(dieanimtimer);
                    if (dieanimtimer < 350) {
                        dieanimtimer++;

                    }  
                }
                diechar.attr({'x': xpos, 'y': diechar.y, 'src':activeurl})           
            }

        }


         var bounceintv = setInterval(bounce, 6);                    



            var promptname = function() {

                clearInterval(bounceintv);
                var x = 0
                var y = 0

                function update() {
                    while (x <= 4) {
                        console.log(highscores[x]);
                        localStorage.setItem((x+1), JSON.stringify(highscores[x]));
                        console.log(localStorage.getItem(x+1))
                        console.log("updated")
                        x++;
                        if (x == 5) {
                            location.reload();
                        }      
                    }
                }

                while (y < 5) {
                    console.log(y)

                    if (score >= highscores[y].score) {
                        if (name == undefined) {
                            name = prompt("You hit a High Score! Enter your name :)");
                            console.log("ask for name")
                
                            console.log(y);
                            highscores.splice(y, 0, {"name": name, "score": score});
                            console.log(highscores);
                            highscores.pop();
                            update();

                            break
                        }       
                    }
                    else {
                        y++;
                        if (y == 5) {
                            console.log(y)
                            location.reload();
                        }
                    }

                    
                }

                
                location.reload();


                
                
            }

        
});




